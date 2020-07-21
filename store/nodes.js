/* eslint no-shadow: ["error", { "allow": ["state"] }] */

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  nodes: {},
  nodeIds: [],
});

export const getters = {
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
};

export const mutations = {
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
};
