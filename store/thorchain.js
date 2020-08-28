/* eslint no-shadow: ["error", { "allow": ["state"] }] */
export const state = () => ({
  currentBlockchain: 'testnet',
});

export const mutations = {
  toggleBlockchain(state) {
    state.currentBlockchain = state.currentBlockchain === 'chaosnet' ? 'testnet' : 'chaosnet';
  },
};
