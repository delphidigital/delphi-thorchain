/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import {
  assetAmount,
  assetToBase,
  baseToAsset,
  getSwapFee,
  getSwapOutput,
  getSwapSlip,
} from '@thorchain/asgardex-util';

export const state = () => ({
  pool: null,
  side: null,
  amount: null,
  calculationResult: {
    expectedAmount: 0,
    slipPercentage: 0,
    feePercentage: 0,
    feeAsset: 0,
  },
});

export const mutations = {
  setCalculationResult(state, val) {
    state.calculationResult = val;
  },
  setPool(state, val) {
    state.pool = val;
  },
  setSide(state, val) {
    state.side = val;
  },
  setAmount(state, val) {
    state.amount = val;
  },
};

export const actions = {
  async calculate({ state, rootState, commit }) {
    // inputs
    const { amount, side } = state;
    const pool = state.pool || rootState.pools.poolIds[0];
    const poolObj = rootState.pools.pools[pool];

    // calculate amount
    const assetInput = assetToBase(assetAmount(amount));

    const assetPool = {
      assetBalance: assetToBase(assetAmount(poolObj.assetDepth)),
      runeBalance: assetToBase(assetAmount(poolObj.runeDepth)),
    };
    const toRune = (side === 'sell');
    const output = getSwapOutput(assetInput, assetPool, toRune);
    const t = baseToAsset(output, 8);

    // calculate slippage
    const slip = getSwapSlip(assetInput, assetPool, toRune);
    // const slipAsset = baseToAsset(slip, 8);

    // calculate fee
    const fee = getSwapFee(assetInput, assetPool, toRune);
    const feeAsset = baseToAsset(fee);
    const feePercentage = feeAsset.amount().div(t.amount());

    commit('setCalculationResult', {
      expectedAmount: t.amount().toNumber(),
      slipPercentage: slip.toNumber(),
      feePercentage: feePercentage.toNumber(),
      feeAsset: feeAsset.amount().toNumber(),
      totalPercentage: feePercentage.plus(slip).toNumber(),
    });
  },
};
