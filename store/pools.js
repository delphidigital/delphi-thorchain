/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// import { subMonths } from 'date-fns';
import { loadPools } from '../lib/api.mjs';

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  pools: {},
  poolIds: [],
});

export const getters = {
};

export const mutations = {
  setPoolIds(state, poolIds) {
    state.poolIds = poolIds;
  },
};

export const actions = {
  async loadPools({ commit }) {
    console.log('load pools');
    const poolIds = await loadPools({
      axios: this.$axios,
    });
    commit('setPoolIds', poolIds);
  },
};
