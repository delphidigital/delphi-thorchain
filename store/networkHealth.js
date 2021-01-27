/* eslint no-shadow: ["error", { "allow": ["state"] }] */
const runeDivider = 10 ** 8;

export const state = () => ({
  totalReserve: null,
  totalPooledRune: null,
  poolShareFactor: null,
  lastThorchainBlock: null,
  lastBinanceChainBlock: null,
});

export const mutations = {
  setNetworkInfo(state, networkInfo) {
    state.totalReserve = parseInt(networkInfo.totalReserve, 10) / runeDivider;
    state.totalPooledRune = parseInt(networkInfo.totalPooledRune, 10) / runeDivider;
    state.poolShareFactor = parseFloat(networkInfo.poolShareFactor);
  },
  setLastThorchainBlock(state, lastBlock) {
    if (lastBlock) {
      state.lastThorchainBlock = parseInt(lastBlock, 10);
    }
  },
  setLastBinanceBlock(state, lastBlock) {
    if (lastBlock) {
      state.lastBinanceBlock = parseInt(lastBlock, 10);
    }
  },
};
