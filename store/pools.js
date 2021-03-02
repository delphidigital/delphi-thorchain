/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const runeDivider = 10 ** 8;

// period24H, period1W, period1M, period3M, period6M, period1Y
export const periodsHistoryMap = {
  '24H': 'period24H',
  '1W': 'period1W',
  '1M': 'period1M',
  '3M': 'period3M',
  '6M': 'period6M',
  '1Y': 'period1Y',
};
// period1H, period24H, period7D, period30D, period90D, period365D, periodALL
// const periodToStatsMap = {
//   '24H': 'period24H',
//   '1W': 'period7D',
//   '1M': 'period30D',
//   '3M': 'period90D',
//   // '6M': 'period180D', // TODO
//   '1Y': 'period365D',
// };

export const runeE8toValue = runeString => (
  runeString
    ? (parseFloat(runeString) / runeDivider)
    : 0
);

export const state = () => ({
  // https://forum.vuejs.org/t/vuex-best-practices-for-complex-objects/10143
  pools: {},
  poolHistoryDepths: {},
  poolHistorySwaps: {},
  poolIds: [],
  technicalAnalysis: {},
  poolsOverview: [],

  // TODO: remove when totalRuneDepth is gone
  periodDepthAndVolume: '1M',
});

export const getters = {
  totalRuneDepth(state) { // TODO: replace this with (allPoolsDepthsAndVolumesWithAverages().totalDepth / 2)
    return state.pools.reduce((result, item) => (
      (
        result
        + parseInt((item?.poolStats?.periodALL?.runeDepth || 0), 10) / runeDivider
      )
    ), 0);
  },
};

export const mutations = {
  setPoolsOverview(state, poolsOverview) {
    state.poolsOverview = poolsOverview;
  },
  setPools(state, pools) {
    state.pools = pools;
  },
  setPoolsHistoryDepths(state, poolsHD) {
    state.poolHistoryDepths = poolsHD;
  },
  setPoolsHistorySwaps(state, poolsHS) {
    state.poolHistorySwaps = poolsHS;
  },
  setTechnicalAnalysis(state, payload) {
    state.technicalAnalysis = payload;
  },
};
