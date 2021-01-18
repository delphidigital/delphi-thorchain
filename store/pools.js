/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// import { subMonths } from 'date-fns';
import sortBy from 'sort-by';

const runeDivider = 10 ** 8;

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  pools: {},
  poolIds: [],
  sortBy: 'name',
  sortDescending: false,
});

function aggPoolGetter(state, { attr, min, max }) {
  let ret = 0;
  Object.values(state.pools).forEach((item) => {
    if (max && item[attr] > ret) ret = item[attr];
    if (min && item[attr] < ret) ret = item[attr];
  });
  return ret;
}

// Show first X pools and then aggregate the rest into "Other"
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
  poolList(state) {
    const allPools = [];
    state.poolIds.forEach((poolId) => {
      const pool = state.pools[poolId];
      if (pool) {
        allPools.push({
          name: poolId,
          runeDepth: pool.runeDepth,
          slippageDepth: pool.runeDepth * 0.00504,
          meanFeeAsPercentage:
             pool.sellTxAverage ? (pool.poolFeeAverage / pool.sellTxAverage) : 0,
          volume: pool.poolVolume,
          apy: pool.poolAPY,
          apyRealRewards: null,
        });
      }
    });
    const descChar = state.sortDescending ? '-' : '';
    const sortedPools = allPools.sort(sortBy(`${descChar}${state.sortBy}`));
    return sortedPools;
  },
  poolVolumeAndDepth(state) {
    const allPools = [];

    const maxPoolVolume = getters.maxPoolVolume(state);
    const minPoolVolume = getters.minPoolVolume(state);
    const maxPoolDepth = getters.maxPoolDepth(state);
    const minPoolDepth = getters.minPoolDepth(state);

    state.poolIds.forEach((poolId) => {
      const pool = state.pools[poolId];
      if (pool) {
        const normPoolVolume = (pool.poolVolume - minPoolVolume) / (maxPoolVolume - minPoolVolume);
        const normPoolDepth = (pool.poolDepth - minPoolDepth) / (maxPoolDepth - minPoolDepth);
        allPools.push({
          normPoolDepth,
          normPoolVolume,
          poolVolume: pool.poolVolume,
          poolDepth: pool.poolDepth,
          poolId,
        });
      }
    });


    const ret = aggPoolsByDepth(allPools, 5);

    // NOTE(Fede): Sorting by poolVolume and adding colors as we use the data
    // in several components. Not sure if this is the right place to do this though.
    // Maybe it should be done in a parent component that passes thing as props.
    let index = 0;
    ret
      .sort((a, b) => b.poolVolume - a.poolVolume)
      .forEach((d) => {
        if (d.poolId === 'Other') {
          // eslint-disable-next-line no-param-reassign
          d.color = '#3F4357';
        } else {
          // eslint-disable-next-line no-param-reassign
          d.color = colors[index % (colors.length)];
          index += 1;
        }
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

const parsePoolDetail = poolDetail => ({
  asset: poolDetail.asset,
  assetDepth: parseInt(poolDetail.assetDepth, 10) / runeDivider,
  assetDepthRaw: poolDetail.assetDepth,
  // NEW v2: only available in pool-legacy v2 endpoint
  poolVolume: parseInt(poolDetail.poolVolume, 10) / runeDivider,
  // v2: property renamed from poolVolume24hr to volume24h
  poolVolume24hr: parseInt(poolDetail.volume24h, 10) / runeDivider,
  poolAPY: parseFloat(poolDetail.poolAPY),
  poolDepth: parseInt(poolDetail.poolDepth, 10) / runeDivider,
  // v2 renamed price to assetPrice
  price: parseFloat(poolDetail.assetPrice),
  runeDepth: parseInt(poolDetail.runeDepth, 10) / runeDivider,
  runeDepthRaw: poolDetail.runeDepth,
  // v2: sellFeeAverage not available, using poolFeeAverage instead
  // sellFeeAverage: parseInt(poolDetail.sellFeeAverage, 10) / runeDivider,
  poolFeeAverage: parseInt(poolDetail.poolFeeAverage, 10) / runeDivider,
  // v2 not available, available at pool-legacy
  sellTxAverage: parseInt(poolDetail.sellTxAverage, 10) / runeDivider,
});

export const mutations = {
  setPools(state, pools) {
    state.poolIds = pools.map(p => p.poolId);
    pools.forEach((p) => {
      const detail = parsePoolDetail(p.poolDetail);
      state.pools[p.poolId] = detail;
    });
  },
  setSortBy(state, fieldName) {
    state.sortBy = fieldName;
    state.sortAscending = true;
  },
  toggleSortDescending(state) {
    state.sortDescending = !state.sortDescending;
  },
};
