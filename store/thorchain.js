/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable import/prefer-default-export */
export const state = () => ({
  loading: false,
});

export const mutations = {
  loadingOn(state) {
    state.loading = true;
  },
  loadingOff(state) {
    state.loading = false;
  },
};
