/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const formatValue = 10 ** 8;

// TODO: When there are more chains than the BNB chain in the future
// summarize all coins from each chain and filter with `RUNE-67C`
const runeChainSymbol = 'BNB.RUNE-67C';
const RUNE = `${assetFromString(runeChainSymbol).chain}.${assetFromString(runeChainSymbol).symbol}`;

export const state = () => ({
  poolAddress: '',
  binanceBalances: [],
});

export const getters = {
  activeVault(s, g, rootState) {
    return rootState.nodes.asgardVaults.slice().filter(vault => vault.status === 'active')[0];
  },
  coins(s, g, rootState) {
    const priceByRUNE = coin =>
      (coin.asset === RUNE ? 1 : rootState.pools.pools[coin.asset].price);
    const output = [];
    g.activeVault.coins.forEach((coin) => {
      output.push({
        asset: coin.asset,
        amount: Number(coin.amount) / formatValue,
        amountRecorded:
          Number(
            s.binanceBalances.filter(i =>
              i.symbol.includes(assetFromString(coin.asset).symbol),
            )[0].free),
        price: Number(priceByRUNE(coin)),
      });
    });
    return output.sort((a, b) => (b.amount * b.price) - (a.amount * a.price));
  },
  topList(s, g) {
    return g.coins.filter(item => !item.asset.includes(RUNE)).slice(0, nRankedCoins);
  },
  solvency(s, g) {
    const rune = g.coins.filter(item => item.asset.includes(RUNE))[0];
    const other = g.coins.filter(item => !item.asset.includes(RUNE));

    return {
      rune: (rune.amount / rune.amountRecorded),
      other: other.reduce((total, item) => total + item.amount, 0) /
        other.reduce((total, item) => total + item.amountRecorded, 0),
    };
  },
};

export const mutations = {
  setPoolAddress(state, poolAddresses) {
    state.poolAddress = poolAddresses.current[0].address;
  },
  setBinanceBalances(state, binanceChain) {
    // Keep in mind that while churning the vaults you get a 404
    // This churning process can last a couple of hours
    if (binanceChain.balances) {
      const stabilize = binanceChain.balances;
      stabilize.sort((a, b) => a.symbol.localeCompare(b.symbol));
      state.binanceBalances = stabilize;
    } else {
      state.binanceBalances =
        { balances: [{ name: null, assetsStored: null, assetsRecorded: null }] };
    }
  },
};
