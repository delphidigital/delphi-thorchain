/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const e8 = 10 ** 8;

export const state = () => ({
  binanceBalances: {},
  runevaultBalance: 0,
});

export const getters = {
  // Counts coins on all vaults (active + retiring)
  coins(s, g, rootState) {
    const runePrice = (asset) => {
      if (assetFromString(asset).ticker === 'RUNE') return 1;
      const pool = rootState.pools.pools.find(p => p.poolId === asset);
      if (!pool) return null;
      return pool.poolStats.periodALL.assetPrice;
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
      const amountStored = s.binanceBalances[assetFromString(asset).symbol] || 0;
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
  setBinanceBalances(state, binanceAccounts) {
    const balances = {};
    (binanceAccounts || []).forEach((account) => {
      account.balances.forEach((balance) => {
        const current = balances[balance.symbol] || 0;
        balances[balance.symbol] = current + parseFloat(balance.free);
      });
    });
    state.binanceBalances = balances;
  },
  setRunevaultBalance(state, runevaultBalance) {
    state.runevaultBalance = parseInt(runevaultBalance, 10);
  },
};
