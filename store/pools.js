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
          meanFeeAsPercentage: pool.meanFeeAsPercentage,
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

const parsePoolStats = poolStats => ({
  // NOTE: v2 api for pool details is not providing poolFeeAverage value, need to calculate it
  // previous code: ellFeeAverage: parseInt(poolStats.sellFeeAverage, 10) / runeDivider,
  // const poolFeeAverage = poolStats.swapCount
  //   ? (parseInt(poolStats.totalFees / poolStats.swapCount, 10) / runeDivider)
  //   : 0;

  // NOTE: v2 api for pool details is not providing sellTxAverage value, in fact v1 was using it
  //       wrongly because it does not account for all transactions. (only sell/toRune ones)
  //       v2 fix is to use the next swapVolumeAverage formula:
  // const swapVolumeAverage = parseInt(
  //   (
  //     (
  //       (poolStats.toRuneCount ? (poolStats.toRuneVolume / poolStats.toRuneCount) : 0) +
  //       (poolStats.toAssetCount ? (poolStats.toAssetVolume / poolStats.toAssetCount) : 0)
  //     ) / runeDivider
  //   ), 10,
  // );
  // NOTE: v2 now calculates meanFeeAsPercentage at state, this is an alternative formula
  // const meanFeeAsPercentage = swapVolumeAverage ? (poolFeeAverage / swapVolumeAverage) : 0;
  asset: poolStats.asset,
  assetDepth: parseInt(poolStats.assetDepth, 10) / runeDivider,
  assetDepthRaw: poolStats.assetDepth,

  // NOTE: v2 api for pool stats renamed poolVolume to swapVolume now
  poolVolume: parseInt(poolStats.swapVolume, 10) / runeDivider,

  // NOTE: v2 property renamed from poolVolume24hr to volume24h
  poolVolume24hr: parseInt(poolStats.volume24h, 10) / runeDivider,
  poolAPY: parseFloat(poolStats.poolAPY),

  // NOTE: v2 api for pool details is not providing poolDepth value,
  //       poolDepth can be calculated as poolStats.runeDepth * 2
  poolDepth: parseInt(poolStats.runeDepth * 2, 10) / runeDivider,

  // NOTE: v2 renamed price to assetPrice
  price: parseFloat(poolStats.assetPrice),
  runeDepth: parseInt(poolStats.runeDepth, 10) / runeDivider,
  runeDepthRaw: poolStats.runeDepth,

  // NOTE: Alternative formula to calculate meanFeeAsPercentage
  meanFeeAsPercentage: poolStats.swapVolume ? (poolStats.totalFees / poolStats.swapVolume) : 0,
  // meanFeeAsPercentage: swapVolumeAverage ? (poolFeeAverage / swapVolumeAverage) : 0,
});

export const mutations = {
  setPools(state, pools) {
    state.poolIds = pools.map(p => p.poolId);
    pools.forEach((p) => {
      const detail = parsePoolStats(p.poolStats);
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
