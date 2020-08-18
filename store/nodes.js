/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const secondsPerBlock = 5;
const runeDivider = 10 ** 8;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  nodes: {},
  nodeIds: [],
  oldValidatorRate: null,
  nextChurnHeight: 0,
  rotatePerBlockHeight: null,
  asgardVaults: [],
  minBond: null,
  secondsPerBlock,
});

export const getters = {
  activeNodesSegmentedForChurn(state) {
    const forcedToLeave = [];
    const requestedToLeave = [];
    const scheduledToLeave = [];
    const otherValidatorsByAge = [];
    Object.values(state.nodes).filter(node => (
      node.status === 'active'
    )).sort((a, b) => {
      const aBlock = parseInt(a['status_since'], 10);
      const bBlock = parseInt(b['status_since'], 10);
      if (aBlock < bBlock) return -1;
      if (aBlock > bBlock) return 1;
      return 0;
    }).forEach((node) => {
      if (node['forced_to_leave']) {
        forcedToLeave.push(node);
        return;
      }

      if (node['requested_to_leave']) {
        requestedToLeave.push(node);
        return;
      }

      otherValidatorsByAge.push(node);
    });

    return {
      forcedToLeave,
      requestedToLeave,
      scheduledToLeave,
      oldestValidators: otherValidatorsByAge.slice(0, 1),
      otherValidatorsByAge: otherValidatorsByAge.slice(1),
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
  progressToNextChurnPoint(state, rootState) {
    let blocksRemaining;
    let percentage;
    if (getters.activeRequestedToLeaveCount(state)) {
      const blocksSince = rootState.lastThorchainBlock % state.rotatePerBlockHeight;
      blocksRemaining = state.rotatePerBlockHeight - blocksSince;
      percentage = blocksSince / state.rotatePerBlockHeight;
    } else {
      const blocksSince = rootState.lastThorchainBlock % state.oldValidatorRate;
      blocksRemaining = state.oldValidatorRate - blocksSince;
      percentage = blocksSince / state.oldValidatorRate;
    }
    const time = blocksRemaining * secondsPerBlock;
    const retiring = getters.isAsgardVaultRetiring(state);
    const standby = getters.standbyNodesByBond(state);
    const noEligible = standby.toChurnIn.length === 0;
    return {
      secondsRemaining: time,
      updatedAt: new Date(),
      blocksRemaining,
      percentage: retiring || noEligible ? 0 : percentage,
      paused: retiring || noEligible,
      retiring,
      noEligible,
    };
  },
  locations(state) {
    const locs = Object.values(state.nodes).map(n => n.location);
    return locs;
  },
  standbyNodesByBond(state) {
    const toChurnIn = getters.expectedNodeCountToChurnOut(state) + 1;
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
  expectedNodeCountToChurnOut(state) {
    const {
      forcedToLeave,
      requestedToLeave,
      scheduledToLeave,
      oldestValidators,
    } = getters.activeNodesSegmentedForChurn(state);
    const count = forcedToLeave.length + requestedToLeave.length +
      scheduledToLeave.length + oldestValidators.length;
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
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'standby' && !node['requested_to_leave'] ? total + 1 : total
    ), 0);
  },
  activeRequestedToLeaveCount(state) {
    return Object.values(state.nodes).reduce((total, node) => (
      node.status === 'active' && node['requested_to_leave'] ? total + 1 : total
    ), 0);
  },
};

export const mutations = {
  setOldValidatorRate(state, oldValidatorRate) {
    state.oldValidatorRate = oldValidatorRate;
  },
  setMinBond(state, minBond) {
    state.minBond = parseInt(minBond, 10) / runeDivider;
  },
  setAsgardVaults(state, asgardVaults) {
    state.asgardVaults = asgardVaults;
  },
  setNextChurnHeight(state, nextChurnHeight) {
    state.nextChurnHeight = parseInt(nextChurnHeight, 10);
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
  setRotatePerBlockHeight(state, rotatePerBlockHeight) {
    state.rotatePerBlockHeight = parseInt(rotatePerBlockHeight, 10);
  },
};
