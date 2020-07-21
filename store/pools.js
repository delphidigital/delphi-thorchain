/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// import { subMonths } from 'date-fns';
import { loadPools } from '../lib/api.mjs';

const runeDivider = 100000;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  pools: {},
  poolIds: [],
});

function aggPoolGetter(state, { attr, min, max }) {
  let ret = 0;
  Object.values(state.pools).forEach((item) => {
    if (max && item[attr] > ret) ret = item[attr];
    if (min && item[attr] < ret) ret = item[attr];
  });
  return ret;
}

export const getters = {
  maxPoolDepth(state) {
    return aggPoolGetter(state, { attr: 'poolDepth', max: true });
  },
  minPoolDepth(state) {
    return aggPoolGetter(state, { attr: 'poolDepth', min: true });
  },
  maxPoolVolume(state) {
    return aggPoolGetter(state, { attr: 'poolVolume', max: true });
  },
  minPoolVolume(state) {
    return aggPoolGetter(state, { attr: 'poolVolume', min: true });
  },
  poolVolumeAndDepth(state) {
    const ret = [];

    const maxPoolVolume = getters.maxPoolVolume(state);
    const minPoolVolume = getters.minPoolVolume(state);
    const maxPoolDepth = getters.maxPoolDepth(state);
    const minPoolDepth = getters.minPoolDepth(state);

    state.poolIds.forEach((poolId) => {
      const pool = state.pools[poolId];
      const normPoolVolume = (pool.poolVolume - minPoolVolume) / (maxPoolVolume - minPoolVolume);
      const normPoolDepth = (pool.poolDepth - minPoolDepth) / (maxPoolDepth - minPoolDepth);
      ret.push({
        normPoolDepth,
        normPoolVolume,
        poolVolume: pool.poolVolume,
        poolDepth: pool.poolDepth,
        poolId,
      });
    });

    return ret;
  },
  totalPoolDepth(state) {
    return Object.values(state.pools).reduce((result, item) => (
      (result + item.poolDepth)
    ), 0);
  },
  totalRuneDepth(state) {
    return Object.values(state.pools).reduce((result, item) => (
      (result + item.runeDepth)
    ), 0);
  },
};

export const mutations = {
  setPoolIds(state, poolIds) {
    state.poolIds = poolIds;
  },
  setPoolDetail(state, { poolId, poolDetail }) {
    state.pools[poolId] = {
      ...poolDetail,
      poolVolume: parseInt(poolDetail.poolVolume, 10) / runeDivider,
      poolVolume24h: parseInt(poolDetail.poolVolume24h, 10) / runeDivider,
      poolDepth: parseInt(poolDetail.poolDepth, 10) / runeDivider,
      runeDepth: parseInt(poolDetail.runeDepth, 10) / runeDivider,
    };
  },
};

export const actions = {
  async loadPools({ commit }) {
    const poolIds = await loadPools({
      axios: this.$axios,
    });
    commit('setPoolIds', poolIds);
  },
};
