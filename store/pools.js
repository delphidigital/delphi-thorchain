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

function aggPoolsByDepth(pools, numberBeforeAgg) {
  const shallowCopy = [...pools];
  shallowCopy.sort((a, b) => b.poolDepth - a.poolDepth);
  const first = shallowCopy.slice(0, numberBeforeAgg);
  const second = shallowCopy.slice(numberBeforeAgg);
  const aggregate = {
    poolId: 'Other',
  };

  second.forEach((pool) => {
    aggregate.normPoolDepth = (aggregate.normPoolDepth || 0) + pool.normPoolDepth;
    aggregate.normPoolVolume = (aggregate.normPoolVolume || 0) + pool.normPoolVolume;
    aggregate.poolVolume = (aggregate.poolVolume || 0) + pool.poolVolume;
    aggregate.poolDepth = (aggregate.poolDepth || 0) + pool.poolDepth;
  });

  return first.concat(aggregate);
}

const colors = [
  '#4346D3',
  '#5E2BBC',
  '#F7517F',
  '#2D99FF',
  '#3F4357',
  '#16CEB9',
];

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
    const allPools = [];

    const maxPoolVolume = getters.maxPoolVolume(state);
    const minPoolVolume = getters.minPoolVolume(state);
    const maxPoolDepth = getters.maxPoolDepth(state);
    const minPoolDepth = getters.minPoolDepth(state);

    state.poolIds.forEach((poolId) => {
      const pool = state.pools[poolId];
      const normPoolVolume = (pool.poolVolume - minPoolVolume) / (maxPoolVolume - minPoolVolume);
      const normPoolDepth = (pool.poolDepth - minPoolDepth) / (maxPoolDepth - minPoolDepth);
      allPools.push({
        normPoolDepth,
        normPoolVolume,
        poolVolume: pool.poolVolume,
        poolDepth: pool.poolDepth,
        poolId,
      });
    });


    const ret = aggPoolsByDepth(allPools, 5);

    // NOTE(Fede): Sorting by poolVolume and adding colors as we use the data
    // in several components. Not sure if this is the right place to do this though.
    // Maybe it should be done in a parent component that passes thing as props.
    ret
      .sort((a, b) => b.poolVolume - a.poolVolume)
      .forEach((d, index) => {
        // eslint-disable-next-line no-param-reassign
        d.color = colors[index % (colors.length)];
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
