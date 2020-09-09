/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import { addSeconds } from 'date-fns';

const secondsPerBlock = 5;
const runeDivider = 10 ** 8;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  nodes: {},
  nodeIds: [],
  rotatePerBlockHeight: null,
  asgardVaults: [],
  minBond: null,
  secondsPerBlock,
});

export const getters = {
  activeNodesSegmentedForChurn(state, g, rootState) {
    const currentHeight = rootState.networkHealth.lastThorchainBlock;
    const activeNodes =
      Object.values(state.nodes).filter(node => (
        node.status === 'active'
      )).map(node => ({ ...node, oldest: false, lowScore: false, lowVersion: false }));

    // find oldest node
    let oldestNode = { status_since: currentHeight };
    activeNodes.forEach((node) => {
      if (
        (parseInt(oldestNode['status_since'], 10) > parseInt(node['status_since'], 10))
      ) {
        oldestNode = node;
      }
    });
    oldestNode.oldest = true;


    // find nodes with bad scores
    const scores = [];
    let lowestScore = currentHeight * 10;
    let lowestScoreNode = null;
    let totalScore = 0;

    activeNodes.forEach((node) => {
      const age = currentHeight - node['status_since'];
      const slashPoints = node['slash_points'];

      if (age > 720 && slashPoints > 0) {
        // NOTE(Fede): Thorchain source code multiplies by 10 ^ 8 to do math using uint64s
        // but we don't really care.
        const score = age / slashPoints;
        totalScore += score;
        if (score < lowestScore) {
          lowestScore = score;
          lowestScoreNode = node;
        }

        scores.push({ node, score });
      }
    });
    // No churning if all nodes young or have 0 slashPts
    if (scores.length > 0) {
      const badNodes = [];
      const avgScore = totalScore / scores.length;
      const threshold = avgScore / 3;
      scores.forEach((score) => {
        if (score.score < threshold) {
          badNodes.push(score.node);
        }
      });
      if (badNodes.length === 0) {
        badNodes.push(lowestScoreNode);
      }
      badNodes.forEach((node) => {
        // eslint-disable-next-line no-param-reassign
        node.lowScore = true;
      });
    }

    // Find nodes with version lower than join version
    activeNodes.forEach((node) => {
      // NOTE(Fede): Asumes no weird version formats and that they all are formatted the
      // same way (ie: no comparisons like 1.12 and 1.12.0 could ever come up)
      const versionCompare =
        node.version.localeCompare(
          state.minJoinVersion,
          undefined,
          { numeric: true, sensitivity: 'base' },
        );

      if (versionCompare === -1) {
        // eslint-disable-next-line no-param-reassign
        node.lowVersion = true;
      }
    });

    // sort nodes 1) forced to leave, 2) requested to leave 3) by leave height 4) by age
    const sortedActiveNodes =
      activeNodes.sort((a, b) => {
        if (a['forced_to_leave'] !== b['forced_to_leave']) {
          return a['forced_to_leave'] ? 1 : -1;
        }
        if (a['requested_to_leave'] !== b['requested_to_leave']) {
          return a['requested_to_leave'] ? 1 : -1;
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
      }).map((node) => {
        // Include in amount to churn count (used to see how many to standby nodes will go in)
        const countsForWillChurn =
          node['forced_to_leave'] ||
          node['requested_to_leave'] ||
          (node['leave_height'] !== '0') ||
          node.oldest ||
          node.lowScore;

        // Determine what status to show on the frontend
        let churnStatusType = 'active';
        if (node['forced_to_leave']) {
          churnStatusType = 'forcedToLeave';
        } else if (node['requested_to_leave']) {
          churnStatusType = 'requestedToLeave';
        } else if (node['leave_height'] !== '0') {
          churnStatusType = 'markedToLeave';
        } else if (node.oldest) {
          churnStatusType = 'oldest';
        } else if (node.lowScore) {
          churnStatusType = 'badNode';
        } else if (node.lowVersion) {
          churnStatusType = 'lowVersion';
        }

        return {
          ...node,
          countsForWillChurn,
          showAsWillChurn: countsForWillChurn || node.lowVersion,
          churnStatusType,
        };
      });

    return sortedActiveNodes;
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
    const blocksSinceLastChurn = currentHeight - lastChurnHeight;
    if (blocksSinceLastChurn > state.rotatePerBlockHeight) {
      // churn retry logic kicks in
      const offsetFromTarget = blocksSinceLastChurn - state.rotatePerBlockHeight;
      blocksRemaining = state.rotateRetryBlocks - (offsetFromTarget % state.rotateRetryBlocks);
    } else {
      blocksRemaining =
        state.rotatePerBlockHeight - (currentHeight % state.rotatePerBlockHeight);
    }

    const secondsRemaining = blocksRemaining * secondsPerBlock;
    const targetTime = addSeconds(new Date(), secondsRemaining);
    const targetBlock = currentHeight + blocksRemaining;
    const maxTime = (targetBlock - lastChurnHeight) * secondsPerBlock;

    const retiring = g.isAsgardVaultRetiring;
    const standby = g.standbyNodesByBond;
    const noEligible = standby.toChurnIn.length === 0;

    return {
      updatedAt: new Date(),
      blocksRemaining,
      targetBlock,
      secondsRemaining,
      targetTime,
      maxTime,
      retiring,
      noEligible,
      paused: retiring || noEligible,
    };
  },
  locations(state) {
    const locs = Object.values(state.nodes).map(n => n.location);
    return locs;
  },
  standbyNodesByBond(state, g) {
    const toChurnIn = g.expectedNodeCountToChurnOut + 1;
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

    g.activeNodesSegmentedForChurn.forEach((n) => {
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

    return count;
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
    // NOTE(Fede): Including Ready nodes here too, as they are show on the standby list
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
  setChurnConstants(state, { rotatePerBlockHeight, rotateRetryBlocks }) {
    state.rotatePerBlockHeight = parseInt(rotatePerBlockHeight, 10);
    state.rotateRetryBlocks = parseInt(rotateRetryBlocks, 10);
  },
};
