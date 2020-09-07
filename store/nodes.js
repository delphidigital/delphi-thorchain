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

    const retiring = getters.isAsgardVaultRetiring(state);
    const standby = getters.standbyNodesByBond(state);
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
  standbyNodesByBond(state) {
    const toChurnIn = getters.expectedNodeCountToChurnOut(state) + 1;
    const belowMinBondNodes = [];
    const otherNodes = [];
    const nodes = Object.values(state.nodes).filter(node => (
      node.status === 'standby'
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
  readyNodesByBond(state) {
    const belowMinBondNodes = [];
    const otherNodes = [];
    const nodes = Object.values(state.nodes).filter(node => (
      node.status === 'ready'
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
      otherValidatorsByBond: otherNodes,
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
  setMinBond(state, minBond) {
    state.minBond = parseInt(minBond, 10) / runeDivider;
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
