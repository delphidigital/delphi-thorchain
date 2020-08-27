/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const formatValue = 10 ** 8;

export const state = () => ({
  poolAddress: '',
  binanceBalances: [],
});

export const getters = {
  activeVault(s, g, rootState) {
    return rootState.nodes.asgardVaults.slice().filter(vault => vault.status === 'active')[0];
  },
  coins(s, g, rootState) {
    const priceByRUNE = (coin) => {
      if (assetFromString(coin.asset).ticker === 'RUNE') return 1;
      if (!rootState.pools.pools[coin.asset]) return null;
      return rootState.pools.pools[coin.asset].price;
    };
    const output = [];
    g.activeVault.coins.forEach((coin) => {
      const price = priceByRUNE(coin);
      if (!price) return;
      output.push({
        asset: coin.asset,
        amount: Number(coin.amount) / formatValue,
        // TODO(Fede): I hacked the free amount there because there's some weird transition
        // between blockchains where this value is non existant and the whole thing fails
        // will check how transitions are debounced so this is smoother
        amountRecorded:
          Number(
            (s.binanceBalances.filter(i =>
              i.symbol.includes(assetFromString(coin.asset).symbol),
            )[0] || { free: 100000000 }).free),
        price: Number(priceByRUNE(coin)),
      });
    });
    return output.sort((a, b) => (b.amount * b.price) - (a.amount * a.price));
  },
  topList(s, g) {
    const other = g.coins.filter(item => !(assetFromString(item.asset).ticker === 'RUNE'));
    return other.slice(0, nRankedCoins);
  },
  solvency(s, g) {
    const rune = g.coins.filter(item => assetFromString(item.asset).ticker === 'RUNE')[0];
    const other = g.coins.filter(item => !(assetFromString(item.asset).ticker === 'RUNE'));

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
