/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const state = () => ({
  slippageCalculator: false,
});

export const mutations = {
  toggleSlippageCalculator(state) {
    state.slippageCalculator = !state.slippageCalculator;
  },
};
