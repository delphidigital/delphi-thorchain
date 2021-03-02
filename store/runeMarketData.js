/* eslint no-shadow: ["error", { "allow": ["state"] }], import/prefer-default-export: 0 */
export const state = () => ({
  // hardcoded for now but should be dynamic from
  // https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false
  circulatingSupply: null,
  priceUSD: null,
  totalValueLockedUSD: null,
});

export const mutations = {
  setData(state, marketData) {
    if (marketData) {
      const circulatingSupply = parseFloat(marketData.circulating);
      const priceUSD = parseFloat(marketData.priceUsd);
      state.totalValueLockedUSD = marketData.totalValueLockedUSD;
      state.circulatingSupply = circulatingSupply;
      state.priceUSD = priceUSD;
    }
  },
};
