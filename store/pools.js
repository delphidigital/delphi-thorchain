/* eslint no-shadow: ["error", { "allow": ["state"] }] */
// import { subMonths } from 'date-fns';
import sortBy from 'sort-by';

const runeDivider = 10 ** 8;
const periodsMap = { period30d: 'periodM', period90d: 'period3M', period365d: 'period1Y' };
const runeE8toValue = runeString => (
  runeString
    ? (parseFloat(runeString) / runeDivider)
    : 0
);

// givem two array with runeDepth property values
// [{runeDepth: 1, startTime: '111'}, {runeDepth: 2, startTime: '222'}] and
// [{runeDepth: 3, startTime: '111'}, {runeDepth: 4, startTime: '222'}]
// combine them to their respective accumulation list:
// [{runeDepth: 4, startTime: '111'}, {runeDepth: 6, startTime: '222'}]
const combineIntervalDepthValues = (intervals1, intervals2) => {
  let firstIntervals = intervals1;
  let secondIntervals = intervals2;
  if (intervals1.length < intervals2.length) {
    firstIntervals = intervals2;
    secondIntervals = intervals1;
  }
  return firstIntervals.map((item, idx) => {
    const runeDepth = (
      (parseFloat(item.runeDepth) || 0)
      + (secondIntervals[idx] ? (parseFloat(secondIntervals[idx].runeDepth) || 0) : 0)
    );
    return { runeDepth, startTime: item.startTime };
  });
};

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  pools: {},
  poolHistoryDepths: {},
  poolHistorySwaps: {},
  poolIds: [],
  sortBy: 'name',
  sortDescending: false,
  // NOTE valid values for period:
  // period1h, period24h, period7d, period30d, period90d, period365d, periodAll
  period: 'periodAll',
  // NOTE: valid values -> 'period30d' 'period90d, period365d'
  periodDepthAndVolume: 'period30d',
});

function aggPoolGetter(state, { attr, min, max }) {
  let ret = 0;
  Object.values(state.pools || []).forEach((poolStats) => {
    const item = poolStats[state.periodDepthAndVolume];
    if (item) {
      if (max && item[attr] > ret) ret = item[attr];
      if (min && item[attr] < ret) ret = item[attr];
    }
  });
  return ret;
}
/*
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
*/

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
      const poolStats = state.pools[poolId];
      const pool = poolStats[state.period];
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
  poolHistoryDepths(state) {
    return state.poolHistoryDepths;
  },
  poolDepthAndVolume(state) {
    const period = periodsMap[state.periodDepthAndVolume];
    const allPoolsSortedByVolume = state.poolIds.map((poolId, index) => {
      // from pool history depths, calculate depth average
      const poolHistoryDepths = state.poolHistoryDepths[poolId];
      const poolPeriodHD = poolHistoryDepths ? poolHistoryDepths[period] : undefined;
      // from pool history swaps, calculate total volume
      const poolHistorySwaps = state.poolHistorySwaps[poolId];
      const poolPeriodHS = poolHistorySwaps ? poolHistorySwaps[period] : undefined;
      // Depth = average depth of the pool over the selected time period (depth = runeDepth * 2)
      const depthIntervals = poolPeriodHD?.intervals || [];
      const totalDepth = depthIntervals.reduce((result, item) => (
        result + (runeE8toValue(item.runeDepth) * 2)
      ), 0);
      const depthAverage = totalDepth ? (totalDepth / depthIntervals.length) : 0;
      // Volume = total volume of pool over selected timeframe
      const swapIntervals = poolPeriodHS?.intervals || [];
      const totalVolume = swapIntervals.reduce((result, item) => (
        result + runeE8toValue(item.totalVolume)
      ), 0);
      return {
        poolId,
        depthIntervals,
        swapIntervals,
        depthAverage,
        totalDepth,
        totalVolume,
        color: colors[index % (colors.length)],
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
    const top5PoolsSortedByVolume = allPoolsSortedByVolume.slice(0, 5);
    const otherPoolsSortedByVolume = allPoolsSortedByVolume.slice(5, allPoolsSortedByVolume.length);
    const other = otherPoolsSortedByVolume.reduce((result, item) => ({
      poolId: 'Other',
      depthAverage: runeE8toValue(item.depthAverage) + result.depthAverage,
      totalDepth: runeE8toValue(item.totalDepth) + result.totalDepth,
      totalVolume: runeE8toValue(item.totalVolume) + result.totalVolume,
      color: '#3F4357',
    }), {
      poolId: 'Other',
      depthAverage: 0,
      totalDepth: 0,
      totalVolume: 0,
      color: '#3F4357',
    });
    other.depthAverage = other.depthAverage
      ? other.depthAverage / otherPoolsSortedByVolume.length
      : 0;
    return [...top5PoolsSortedByVolume, other];
  },
  /*
  poolVolumeAndDepth(state) {
    const allPools = [];
    const maxPoolVolume = getters.maxPoolVolume(state);
    const minPoolVolume = getters.minPoolVolume(state);
    const maxPoolDepth = getters.maxPoolDepth(state);
    const minPoolDepth = getters.minPoolDepth(state);

    state.poolIds.forEach((poolId) => {
      const poolStats = state.pools[poolId];
      const pool = poolStats[state.periodDepthAndVolume];
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
  */
  liquidityDepthOverTime(state) {
    const period = periodsMap[state.periodDepthAndVolume];
    const allPoolsIntervals = state.poolIds.map((poolId) => {
      const poolHistoryDepths = state.poolHistoryDepths[poolId];
      const poolPeriodHD = poolHistoryDepths ? poolHistoryDepths[period] : undefined;
      return poolPeriodHD?.intervals || [];
    });
    const combinedIntervals = allPoolsIntervals.reduce(combineIntervalDepthValues);
    return combinedIntervals.map(val => ({
      date: new Date(val.startTime * 1000),
      value: ((val.runeDepth * 2) / runeDivider),
    }));
  },
  totalPoolsDepth(state) {
    const items = getters.poolDepthAndVolume(state);
    return items.reduce((result, item) => (
      result + item.totalDepth // NOTE: maybe should be the sum of depthAverage???
    ), 0);
    // return Object.values(state.pools).reduce((result, item) => (
    //   (result + (item[state.periodDepthAndVolume]?.poolDepth || 0))
    // ), 0);
  },
  totalRuneDepth(state) { // TODO: replace this with (poolDepthAndVolume().totalDepth / 2)
    return Object.values(state.pools).reduce((result, item) => (
      (
        result
        + parseFloat(item[state.periodDepthAndVolume]?.runeDepth || 0)
        + parseFloat(item[state.periodDepthAndVolume]?.assetDepth || 0)
      )
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
      if (!state.pools[p.poolId]) {
        state.pools[p.poolId] = {};
      }
      // NOTE: poolPeriodStats has this shape:
      // { period1h, period24h, period7d, period30d, period90d, period365d, periodAll }
      Object.entries(p.poolStats).forEach(([periodKey, periodData]) => {
        const detail = parsePoolStats(periodData);
        state.pools[p.poolId][periodKey] = detail;
      });
    });
  },
  setSortBy(state, fieldName) {
    state.sortBy = fieldName;
    state.sortAscending = true;
  },
  toggleSortDescending(state) {
    state.sortDescending = !state.sortDescending;
  },
  togglePeriod(state, period) {
    state.period = period;
  },
  togglePeriodDepthAndVolume(state, period) {
    state.periodDepthAndVolume = period;
  },
  setPoolsHistoryDepths(state, poolsHD) {
    state.poolHistoryDepths = poolsHD;
  },
  setPoolsHistorySwaps(state, poolsHS) {
    state.poolHistorySwaps = poolsHS;
  },
};
