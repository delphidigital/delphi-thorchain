/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const e8 = 10 ** 8;

export const state = () => ({
  poolAddress: '',
  binanceBalances: [],
  runevaultBalance: 0,
});

export const getters = {
  // Counts coins on all vaults (active + retiring)
  coins(s, g, rootState) {
    const runePrice = (asset) => {
      if (assetFromString(asset).ticker === 'RUNE') return 1;
      if (!rootState.pools.pools[asset]) return null;
      return rootState.pools.pools[asset].price;
    };

    const vaults = rootState.nodes.asgardVaults;
    const amountsRecorded = {};

    // Sum all coin amounts on different vaults
    vaults.forEach((v) => {
      v.coins.forEach((coin) => {
        const currentAmount = amountsRecorded[coin.asset] || 0;
        amountsRecorded[coin.asset] = currentAmount + Number(coin.amount);
      });
    });

    const output = [];
    Object.keys(amountsRecorded).forEach((asset) => {
      const price = runePrice(asset);
      if (!price) return;
      const amountRecorded = Number(amountsRecorded[asset]);
      const amountStored =
          Number(
            (s.binanceBalances.filter(i =>
              i.symbol.includes(assetFromString(asset).symbol),
            )[0] || { free: 0 }).free);
      output.push({
        asset,
        // Amount according to Thorchain records
        amountRecorded: amountRecorded / e8,
        // Amount stored in the vault addresses
        amountStored,
        price: Number(price),
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
