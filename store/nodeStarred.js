/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const state = () => ({
  starredMap: {},
});

export const mutations = {
  initializeStore(state) {
    if (localStorage.getItem('starredNodes')) {
      state.starredMap = JSON.parse(localStorage.getItem('starredNodes'));
    }
  },
  toggle(state, nodeAddress) {
    const newMap = {};
    newMap[nodeAddress] = !state.starredMap[nodeAddress];
    state.starredMap = { ...state.starredMap, ...newMap };
    localStorage.setItem('starredNodes', JSON.stringify(state.starredMap));
  },
};
