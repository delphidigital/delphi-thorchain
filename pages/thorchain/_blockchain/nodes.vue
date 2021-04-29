<template>
  <div class="page__container">
    <div class="section-disclamer">
      This product is in open beta, don't make decision based on the information displayed on this dashboard.
      The accuracy of displayed information is still being validated. 
      Please forward any feedback to @bitcoin_sage on twitter.
    </div>
    <div class="page__header">
      <h1 class="page__title">
        Nodes
      </h1>
      <BlockchainToggle />
    </div>

    <div v-if="!this.$store.state.thorchain.loading">
      <div class="pure-g">
        <div class="pure-u-1 pure-u-lg-1-3 section--lg-split-left">
          <NodeStatus />
        </div>

        <div class="pure-u-1 pure-u-lg-2-3 section--lg-split-right nodes-top-right">
          <div class="pure-g">
            <div class="pure-u-1 pure-u-md-5-8 section--split-left">
              <NetworkSecurity />
            </div>
            <div class="pure-u-1 pure-u-md-3-8 section--split-right">
              <NetworkLatestBlocks />
            </div>
          </div>

          <NetworkSolvency />
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-2 section--split-left">
          <no-ssr>
            <LazyHydrate when-visible>
              <ChurnInfo />
            </LazyHydrate>
          </no-ssr>
        </div>
        <div class="pure-u-1 pure-u-md-1-2 section--split-right">
          <no-ssr>
            <LazyHydrate when-visible>
              <NodesByLocation />
            </LazyHydrate>
          </no-ssr>
        </div>
      </div>
      <no-ssr>
        <LazyHydrate when-visible>
          <NodeDetailList />
        </LazyHydrate>
      </no-ssr>
      <Footer />
    </div>
    <div v-else>
      <Loading />
    </div>
  </div>
</template>

<script>
import LazyHydrate from 'vue-lazy-hydration';
import frontendFetcher from '../../../lib/frontendFetcher.mjs';
import NodesByLocation from '../../../components/Network/NodesByLocation.vue';
import ChurnInfo from '../../../components/Network/ChurnInfo.vue';
import NodeDetailList from '../../../components/Network/NodeDetailList.vue';

export default {
  // load data here
  components: {
    LazyHydrate,
    NodesByLocation,
    NodeDetailList,
    ChurnInfo,
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
.nodes-top-right {
  display: flex;
  flex-direction: column;
}

</style>
