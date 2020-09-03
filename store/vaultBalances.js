/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const formatValue = 10 ** 8;

export const state = () => ({
  poolAddress: '',
  binanceBalances: [],
  runevaultBalance: 0,
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
        // Amount according to Thorchain records
        amountRecorded: Number(coin.amount) / formatValue,
        // Amount stored in the vault addresses
        amountStored:
          Number(
            (s.binanceBalances.filter(i =>
              i.symbol.includes(assetFromString(coin.asset).symbol),
            )[0] || { free: 0 }).free),
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
    const otherAmountRecorded = other.reduce((total, item) => total + item.amountRecorded, 0);
    const otherAmountStored = other.reduce((total, item) => total + item.amountStored, 0);

    const runeSolvency = rune.amountRecorded === 0 ? 1 : rune.amountStored / rune.amountRecorded;
    const otherSolvency = otherAmountRecorded === 0 ? 1 : otherAmountStored / otherAmountRecorded;

    return {
      rune: runeSolvency,
      other: otherSolvency,
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
  setRunevaultBalance(state, runevaultBalance) {
    state.runevaultBalance = parseInt(runevaultBalance, 10);
  },
};
