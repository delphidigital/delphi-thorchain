import { subMonths } from 'date-fns';
import { dummyTimeSeriesProgressive, dummyTimeSeriesIntervals } from '../lib/utils.mjs';

const today = new Date();
const someTimeAgo = subMonths(new Date(), 2);

/* eslint no-shadow: ["error", { "allow": ["state"] }], import/prefer-default-export: 0 */
export const state = () => ({
  liquidityDepthOverTime: dummyTimeSeriesProgressive(someTimeAgo, today, 10),
  percentageRuneLockedOverTime: dummyTimeSeriesIntervals(someTimeAgo, today, 20, 100),
});

export const mutations = {
  setStatsHistory(state, statsHistory) {
    state.liquidityDepthOverTime = statsHistory.map(e => ({
      date: e.time * 1000,
      value: parseInt(e.totalRuneDepth, 10),
    }));
  },
};
