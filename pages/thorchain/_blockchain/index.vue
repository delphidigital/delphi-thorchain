<template>
  <div class="page__container">
    <div class="page__header">
      <h1 class="page__title">
        Dashboard
      </h1>
      <BlockchainToggle />
    </div>

    <div v-if="!this.$store.state.thorchain.loading">
      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-2 section--split-left">
          <PoolDepthSummary />
        </div>
        <div class="pure-u-1 pure-u-md-1-2 section--split-right">
          <PercentageRuneLocked />
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1 pure-u-lg-2-3 section--lg-split-left">
        </div>
      </div>

      <PoolList />

      <div class="pure-g">
        <div class="pure-u-1 pure-u-lg-2-3 section--lg-split-left">
          <TopPerformers />
        </div>
        <div class="pure-u-1 pure-u-lg-1-3 section--lg-split-right section-comming-soon">
          <StandbyPools />
        </div>
      </div>

      <NodeSummary />

      <Footer />
    </div>
    <div v-else>
      <Loading />
    </div>
  </div>
</template>

<script>
import frontendFetcher from '../../../lib/frontendFetcher.mjs';
import Footer from '../../../components/Common/Footer.vue';
import PoolDepthSummary from '../../../components/Thorchain/PoolDepthSummary.vue';
import PercentageRuneLocked from '../../../components/Thorchain/PercentageRuneLocked.vue';
import NodeSummary from '../../../components/Thorchain/NodeSummary.vue';

export default {
  // load data here
  components: {
    Footer,
    PercentageRuneLocked,
    PoolDepthSummary,
    NodeSummary,
  },
  async fetch() {
    await frontendFetcher(this, this.$route.params.blockchain);
    this.$store.commit('thorchain/loadingOff');
  },
  beforeMount() {
    window.addEventListener('focus', this.pollDataActivate);
    window.addEventListener('blur', this.pollDataDeactivate);
  },
  mounted() {
    this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    this.$store.commit('nodeStarred/initializeStore');
  },
  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    window.removeEventListener('focus', this.pollDataActivate);
    window.removeEventListener('blur', this.pollDataDeactivate);
  },
  methods: {
    async pollData() {
      await this.$fetch();
      this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    },
    pollDataActivate() {
      if (!this.timeout) {
        this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
      }
    },
    pollDataDeactivate() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .section-comming-soon {
    display: flex;
    flex-direction: column;
    > div {
      flex: 1;
    }
  }
</style>