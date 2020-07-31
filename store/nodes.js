/* eslint no-shadow: ["error", { "allow": ["state"] }] */

const secondsPerBlock = 5;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  nodes: {},
  nodeIds: [],
  oldValidatorRate: null,
  lastBlock: 0,
  nextChurnHeight: 0,
  rotatePerBlockHeight: null,
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

      if (parseInt(node['leave_height'], 10) > 0) {
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
  progressToNextChurnPoint(state) {
    const blocksRemaining = (state.nextChurnHeight - state.lastBlock);
    const percentage = 1 - (blocksRemaining / state.rotatePerBlockHeight);
    const time = blocksRemaining * secondsPerBlock;
    return {
      secondsRemaining: time,
      blocksRemaining,
      percentage,
    };
  },
  standbyNodesByBond(state) {
    const toChurnIn = getters.expectedNodeCountToChurnOut(state) + 1;
    const nodes = Object.values(state.nodes).filter(node => (
      node.status === 'standby' || node.status === 'ready'
    )).sort((a, b) => {
      const aBlock = parseInt(a.bond, 10);
      const bBlock = parseInt(b.bond, 10);
      if (aBlock < bBlock) return 1;
      if (aBlock > bBlock) return -1;
      return 0;
    });
    return {
      toChurnIn: nodes.slice(0, toChurnIn),
      otherValidatorsByBond: nodes.slice(toChurnIn),
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
      node.status === 'standby' ? total + 1 : total
    ), 0);
  },
};

export const mutations = {
  setOldValidatorRate(state, oldValidatorRate) {
    state.oldValidatorRate = oldValidatorRate;
  },
  setLastBlock(state, lastBlock) {
    state.lastBlock = parseInt(lastBlock, 10);
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
        bond: parseInt(node.bond, 10) / 100000000,
      };
    });

    state.nodes = nodeMap;
    state.nodeIds = nodeIds;
  },
  setRotatePerBlockHeight(state, rotatePerBlockHeight) {
    state.rotatePerBlockHeight = parseInt(rotatePerBlockHeight, 10);
  },
};
