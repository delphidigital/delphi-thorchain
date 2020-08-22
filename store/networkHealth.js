/* eslint no-shadow: ["error", { "allow": ["state"] }] */
const runeDivider = 10 ** 8;

export const state = () => ({
  totalReserve: null,
  totalStaked: null,
  poolShareFactor: null,
  lastThorchainBlock: null,
  lastBinanceChainBlock: null,
});

export const mutations = {
  setNetworkInfo(state, networkInfo) {
    state.totalReserve = parseInt(networkInfo.totalReserve, 10) / runeDivider;
    state.totalStaked = parseInt(networkInfo.totalStaked, 10) / runeDivider;
    state.poolShareFactor = parseFloat(networkInfo.poolShareFactor);
  },
  setLastThorchainBlock(state, lastBlock) {
    state.lastThorchainBlock = parseInt(lastBlock, 10);
  },
  setLastBinanceBlock(state, lastBlock) {
    state.lastBinanceBlock = parseInt(lastBlock, 10);
  },
};
