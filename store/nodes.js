
/* eslint no-shadow: ["error", { "allow": ["state"] }] */
const secondsPerBlock = 5.5;
const runeDivider = 10 ** 8;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  nodes: {},
  nodeIds: [],
  rotatePerBlockHeight: null,
  asgardVaults: [],
  minBond: null,
  secondsPerBlock,
  badValidatorRedline: 3,
  minSlashPointsForBadValidator: 100,
  badValidatorRate: 0,
});

export const getters = {
  activeNodesSegmentedForChurnAndThreshold(state, g, rootState) {
    const currentHeight = rootState.networkHealth.lastThorchainBlock;
    const activeNodePropertiesMap = {}; // will store properties by node address
    const activeNodes = Object.values(state.nodes).filter(node => (node.status === 'active'));

    let oldestNodeStatusSince = currentHeight;
    let oldestNodeAddress = null;

    let threshold = 0.0;
    let lowestScore = currentHeight * 10;
    let lowestScoreNodeAddress = null;
    let totalScore = 0;

    activeNodes.forEach((node) => {
      // activeNodePropertiesMap[node.node_address]
      // setup map of extra properties for each node by address
      const nodeProperties = {
        oldest: false,
        lowScore: false,
        lowVersion: false,
        score: null,
        slashPoints: null,
        countsForWillChurn: null,
        showAsWillChurn: null,
        churnStatusType: null,
      };
      // find oldest node
      if ((parseInt(oldestNodeStatusSince, 10) > parseInt(node.status_since, 10))) {
        oldestNodeStatusSince = node.status_since;
        oldestNodeAddress = node.node_address;
      }
      // calculate scores for each active node
      const age = currentHeight - node.status_since;
      const slashPoints = node.slash_points;
      nodeProperties.slashPoints = slashPoints;
      let score = null;
      if (age > state.badValidatorRate && slashPoints > state.minSlashPointsForBadValidator) {
        // NOTE(Fede): Thorchain source code multiplies by 10 ^ 8 to do math using uint64s
        // but we don't really care.
        score = age / slashPoints;
        totalScore += score;
        if (score < lowestScore) {
          lowestScore = score;
          // NOTE: use node_address only, not node object
          lowestScoreNodeAddress = node.node_address;
        }
        nodeProperties.score = score;
      }
      // Find nodes with version lower than join version
      // NOTE(Fede): Asumes no weird version formats and that they all are formatted the
      // same way (ie: no comparisons like 1.12 and 1.12.0 could ever come up)
      const versionCompare =
        node.version.localeCompare(
          state.minJoinVersion,
          undefined,
          { numeric: true, sensitivity: 'base' },
        );

      if (versionCompare === -1) {
        nodeProperties.lowVersion = true;
      }
      activeNodePropertiesMap[node.node_address] = nodeProperties;
    });

    const scoredNodes = Object.keys(activeNodePropertiesMap)
      .filter(addr => activeNodePropertiesMap[addr].score !== null);
    if (oldestNodeAddress) {
      activeNodePropertiesMap[oldestNodeAddress].oldest = true;
    }
    // oldestNode.oldest = true
    // No churning if all nodes young or have 0 slashPts
    if (scoredNodes.length) {
      // const badNodes = [];
      const avgScore = totalScore / scoredNodes.length;
      threshold = avgScore / state.badValidatorRedline;
      let underscoredNodesCount = 0;
      scoredNodes.forEach((scoredNodeAddr) => {
        const nodeProps = activeNodePropertiesMap[scoredNodeAddr];
        if (nodeProps.score < threshold) {
          nodeProps.lowScore = true;
          underscoredNodesCount += 1;
        }
      });
      if (!underscoredNodesCount) { // if no underscored node, bring attention to the lowest one
        activeNodePropertiesMap[lowestScoreNodeAddress].lowScore = true;
      }
    }

    // calculate churn properties
    Object.values(activeNodes).forEach((node) => {
      const nodeProps = activeNodePropertiesMap[node.node_address];
      // Include in amount to churn count (used to see how many to standby nodes will go in)
      const countsForWillChurn =
        node['forced_to_leave'] ||
        node['requested_to_leave'] ||
        (node['leave_height'] !== '0') ||
        nodeProps.oldest ||
        nodeProps.lowScore;

      // Determine what status to show on the frontend
      let churnStatusType = 'active';
      if (node['forced_to_leave']) {
        churnStatusType = 'forcedToLeave';
      } else if (node['requested_to_leave']) {
        churnStatusType = 'requestedToLeave';
      } else if (node['leave_height'] !== '0') {
        churnStatusType = 'markedToLeave';
      } else if (nodeProps.oldest) {
        churnStatusType = 'oldest';
      } else if (nodeProps.lowScore) {
        churnStatusType = 'badNode';
      } else if (nodeProps.lowVersion) {
        churnStatusType = 'lowVersion';
      }
      activeNodePropertiesMap[node.node_address].countsForWillChurn = countsForWillChurn;
      activeNodePropertiesMap[node.node_address].showAsWillChurn = (
        countsForWillChurn || node.lowVersion
      );
      activeNodePropertiesMap[node.node_address].churnStatusType = churnStatusType;
    });

    // sort nodes 1) forced to leave, 2) requested to leave 3) by leave height 4) by age
    const sortedActiveNodes =
      activeNodes.sort((a, b) => {
        if (a['forced_to_leave'] !== b['forced_to_leave']) {
          return a['forced_to_leave'] ? -1 : 1;
        }
        if (a['requested_to_leave'] !== b['requested_to_leave']) {
          return a['requested_to_leave'] ? -1 : 1;
        }
        if (a['leave_height'] !== b['leave_height']) {
          // lowest non zero leave height goes first
          // means the node was marked to exit at an earlier block
          const aLh = parseInt(a['status_since'], 10);
          const bLh = parseInt(b['status_since'], 10);
          if (aLh === 0) {
            return 1;
          }
          if (bLh === 0) {
            return -1;
          }
          return aLh - bLh;
        }

        // lowest status since (oldest node) goes first
        const aBlock = parseInt(a['status_since'], 10);
        const bBlock = parseInt(b['status_since'], 10);
        return aBlock - bBlock;
      }).map(activeNode => ({
        ...activeNode,
        ...(activeNodePropertiesMap[activeNode.node_address] || {}),
      }));
    return {
      activeNodes: sortedActiveNodes,
      threshold,
      badValidatorRedline: state.badValidatorRedline,
    };
  },
  countsByStatus(state) {
    const statusMap = {};
    Object.values(state.nodes).forEach((node) => {
      if (!statusMap[node.status]) statusMap[node.status] = 0;
      statusMap[node.status] += 1;
    });
    return statusMap;
  },
  disabledNodes(state) {
    return Object.values(state.nodes).filter(node => (
      node.status === 'disabled'
    )).sort((a, b) => {
      const aBlock = parseInt(a['status_since'], 10);
      const bBlock = parseInt(b['status_since'], 10);
      if (aBlock < bBlock) return -1;
      if (aBlock > bBlock) return 1;
      return 0;
    });
  },
  isAsgardVaultRetiring(state) {
    return !!state.asgardVaults.filter(vault => vault.status === 'retiring').length;
  },
  progressToNextChurnPoint(state, g, rootState) {
    // lastChurnHeight is max block height from all active vaults
    const lastChurnHeight =
      state.asgardVaults.reduce((acc, av) => {
        if (av.status === 'active') {
          return Math.max(av.block_height, acc);
        }
        return acc;
      }, 0);
    const currentHeight = rootState.networkHealth.lastThorchainBlock;

    let blocksRemaining;
    let waitingForChurn = false;
    const blocksSinceLastChurn = currentHeight - lastChurnHeight;
    if (blocksSinceLastChurn > state.rotatePerBlockHeight) {
      // churn retry logic kicks in
      const offsetFromTarget = blocksSinceLastChurn - state.rotatePerBlockHeight;

      // Keep the previous target for the first 10 blocks as vault takes a couple of
      // blocks to enter retired state
      if (offsetFromTarget > 10) {
        blocksRemaining = state.rotateRetryBlocks - (offsetFromTarget % state.rotateRetryBlocks);
      } else {
        waitingForChurn = true;
        blocksRemaining = -offsetFromTarget;
      }
    } else {
      // normally churn is attempted when rotatePerBlockHeight blocks pass since last churn
      blocksRemaining =
        state.rotatePerBlockHeight - blocksSinceLastChurn;
    }

    const retiring = g.isAsgardVaultRetiring;
    const standby = g.standbyNodesByBond;
    const noEligible = standby.toChurnIn.length === 0;
    const paused = retiring || noEligible;

    const secondsRemaining = paused ? 0 : Math.max(blocksRemaining * secondsPerBlock, 0);
    const targetBlock = currentHeight + blocksRemaining;
    const maxTime = (targetBlock - lastChurnHeight) * secondsPerBlock;

    // TODO: Handle churn attempt on the front end
    return {
      updatedAt: new Date(),
      blocksRemaining,
      targetBlock,
      secondsRemaining,
      noEligible,
      maxTime,
      retiring,
      paused,
      waitingForChurn,
    };
  },
  locations(state) {
    const locs = Object.values(state.nodes).map(n => n.location);
    return locs;
  },
  standbyNodesByBond(state, g) {
    // Will churn in (churned out + 1) nodes as long as remaing count
    // is less or equal than desireValidatorSet constant
    const activeNodes = g.totalActiveCount;
    const expectedToChurnOut = g.expectedNodeCountToChurnOut;
    const expectedRemainingActive = activeNodes - expectedToChurnOut;
    // NOTE(Fede): Thornode has an off by one error when
    // computing and adds an extra node than the
    // desireValidatorSet.
    // Be aware of this in case it gets fixed
    const diffWithDesired =
      (state.desireValidatorSet + 1) - expectedRemainingActive;
    const toChurnIn = Math.min(
      expectedToChurnOut + 1,
      diffWithDesired > 0 ? diffWithDesired : 0);

    const belowMinBondNodes = [];
    const otherNodes = [];
    const nodes = Object.values(state.nodes).filter(node => (
      node.status === 'standby' || node.status === 'ready'
    )).sort((a, b) => {
      const aBlock = parseInt(a.bond, 10);
      const bBlock = parseInt(b.bond, 10);
      if (aBlock < bBlock) return 1;
      if (aBlock > bBlock) return -1;
      return 0;
    });
    nodes.forEach((node) => {
      if (node.bond < state.minBond) {
        belowMinBondNodes.push(node);
        return;
      }

      if (node['requested_to_leave']) {
        return;
      }

      otherNodes.push(node);
    });
    return {
      belowMinBond: belowMinBondNodes,
      toChurnIn: otherNodes.slice(0, toChurnIn),
      otherValidatorsByBond: otherNodes.slice(toChurnIn),
    };
  },
  expectedNodeCountToChurnOut(state, g) {
    let count = 0;
    let hasLowVersion = false;

    g.activeNodesSegmentedForChurnAndThreshold.activeNodes.forEach((n) => {
      if (n.countsForWillChurn) {
        count += 1;
      }
      if (n.lowVersion) {
        hasLowVersion = true;
      }
    });

    // If there are nodes with low version
    // one will be picked to be churned out at
    // next churn point
    if (hasLowVersion) {
      count += 1;
    }

    return Math.min(
      count,
      Math.floor(g.activeNodesSegmentedForChurnAndThreshold.activeNodes.length / 3),
    );
  },
  totalActiveBonded(state) {
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'active' ? total + node.bond : total
    ), 0);
  },
  totalStandbyBonded(state) {
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'standby' ? total + node.bond : total
    ), 0);
  },
  totalActiveCount(state) {
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'active' ? total + 1 : total
    ), 0);
  },
  totalStandbyCount(state) {
    // NOTE(Fede): Including Ready nodes here too, as they are shown on the standby list
    return Object.values(state.nodes).reduce((total, node) => (
      (node.status === 'standby' || node.status === 'ready') && !node['requested_to_leave'] ? total + 1 : total
    ), 0);
  },
  activeRequestedToLeaveCount(state) {
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'active' && node['requested_to_leave'] ? total + 1 : total
    ), 0);
  },
};

export const mutations = {
  setGlobalParams(state, { minBond, minJoinVersion }) {
    state.minBond = parseInt(minBond, 10) / runeDivider;
    state.minJoinVersion = minJoinVersion;
  },
  setAsgardVaults(state, asgardVaults) {
    state.asgardVaults = asgardVaults;
  },
  setBadValidatorRedline(state, threshold) {
    state.badValidatorRedline = threshold;
  },
  setMinSlashPointsForBadValidator(state, threshold) {
    state.minSlashPointsForBadValidator = threshold;
  },
  setBadValidatorRate(state, rate) {
    state.badValidatorRate = rate;
  },
  setNodeAccounts(state, nodeAccounts) {
    const nodeIds = [];
    const nodeMap = {};

    nodeAccounts.forEach((node) => {
      const nodeId = node['node_address'];
      nodeIds.push(nodeId);
      nodeMap[nodeId] = {
        ...node,
        bond: parseInt(node.bond, 10) / runeDivider,
      };
    });

    state.nodes = nodeMap;
    state.nodeIds = nodeIds;
  },
  setChurnConstants(state, { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet }) {
    state.rotatePerBlockHeight = parseInt(rotatePerBlockHeight, 10);
    state.rotateRetryBlocks = parseInt(rotateRetryBlocks, 10);
    state.desireValidatorSet = parseInt(desireValidatorSet, 10);
  },
};
