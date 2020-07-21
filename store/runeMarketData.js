/* eslint no-shadow: ["error", { "allow": ["state"] }], import/prefer-default-export: 0 */
export const state = () => ({
  // hardcoded for now but should be dynamic from
  // https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false
  circulatingSupply: 175552528,
  priceUSD: 0.51944,
});
