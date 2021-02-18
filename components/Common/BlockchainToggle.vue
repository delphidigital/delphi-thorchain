<template>
  <div class="toggle__container">
    <p
      class="toggle__value"
      :class="{ 'toggle__value--active': !chaosnet }"
    >
      Testnet
    </p>
    <button
      class="toggle__button"
      @click="toggleBlockchain"
    >
      <div
        class="toggle__inside"
        :class="{ 'toggle__inside--right': chaosnet }"
      />
    </button>
    <p
      class="toggle__value"
      :class="{ 'toggle__value--active': chaosnet }"
    >
      Chaosnet
    </p>
  </div>
</template>

<script>
export default {
  computed: {
    chaosnet() {
      return this.$route.params.blockchain === 'chaosnet';
    },
  },
  methods: {
    toggleBlockchain() {
      const { name, params } = this.$route;
      const blockchain = params.blockchain === 'chaosnet' ? 'testnet' : 'chaosnet';
      this.$store.commit('thorchain/loadingOn');
      this.$router.push({ name, params: { blockchain } });
    },
  },
};
</script>

<style lang="scss" scoped>
  .toggle__container {
    display: flex;
    align-items: center;
    font-family: Montserrat, sans-serif;
  }

  .toggle__value {
    font-size: 14px;
    opacity: 0.5;
    transition: opacity 0.3s ease-in-out;
  }

  .toggle__value--active {
    opacity: 1;
  }

  .toggle__button {
    height: 20px;
    width: 36px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 1000px;
    position: relative;
    border: none;
    outline: none;
    margin: 0 12px;
    padding: 0;
    cursor: pointer;
  }

  .toggle__inside {
    height: 16px;
    width: 16px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s ease-in-out;
  }

  .toggle__inside--right {
    left: 18px;
  }
</style>
