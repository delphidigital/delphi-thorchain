/* eslint no-shadow: ["error", { "allow": ["state"] }] */

import { assetFromString } from '@thorchain/asgardex-util';

const nRankedCoins = 5;
const e8 = 10 ** 8;

export const state = () => ({
  binanceBalances: {},
  runevaultBalance: 0,
  chainBalances: null,
});

export const getters = {
  // Counts coins on all vaults (active + retiring)
  coins(s, g, rootState) {
    const runePrice = (asset) => {
      if (asset === 'RUNE') { return 1; }
      const pool = rootState.pools.pools.find((p) => {
        const assetKey = assetFromString(p.poolId);
        return assetKey.ticker === asset;
      });
      if (!pool) {
        return null;
      }
      return pool.poolStats.periodALL.assetPrice;
    };
    const amountsRecorded = {};
    const vaults = rootState.nodes.asgardVaults;
    vaults.forEach((v) => {
      v.coins.forEach((coin) => {
        const assetSymbol = assetFromString(coin.asset).ticker;
        const currentAmount = amountsRecorded[assetSymbol] || 0;
        const newAmount = Number(coin.amount) / (coin.decimals ? (10 ** coin.decimals) : e8);
        amountsRecorded[assetSymbol] = currentAmount + newAmount;
      });
    });
    const output = [];
    Object.keys(amountsRecorded).forEach((asset) => {
      const price = runePrice(asset);
      if (!s.chainBalances || !price) {
        return;
      }
      const amountRecorded = amountsRecorded[asset];
      const assetMultichainBalances = s.chainBalances.filter(b => (
        b.symbol
          ? (assetFromString(`${b.network}.${b.symbol}`).ticker === asset)
          : (b.network === asset)
      ));
      const amountStored = assetMultichainBalances.reduce((acc, next) => acc + next.balance, 0);
      output.push({
        asset,
        // Amount according to Thorchain records
        amountRecorded,
        // Amount stored in the vault addresses
        amountStored,
        price: Number(price),
      });
    });
    return output.sort((a, b) => (b.amount * b.price) - (a.amount * a.price));
  },
  topList(s, g) {
    const other = g.coins.filter(item => !(item.asset === 'RUNE'));
    return other.slice(0, nRankedCoins);
  },
  solvency(s, g) {
    const rune = g.coins.find(item => item.asset === 'RUNE');
    const other = g.coins.filter(item => !item.asset === 'RUNE');
    const otherAmountRecorded = other.reduce((total, item) => total + item.amountRecorded, 0);
    const otherAmountStored = other.reduce((total, item) => total + item.amountStored, 0);
    const runeSolvency = rune && rune.amountRecorded ? (rune.amountStored / rune.amountRecorded) : 1;
    const otherSolvency = otherAmountRecorded ? (otherAmountStored / otherAmountRecorded) : 1;

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
  setChainBalances(state, payload) {
    state.chainBalances = payload;
  },
};
