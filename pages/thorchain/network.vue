<template>
  <div class="page__container">
    <div class="page__header">
      <h1 class="page__title">
        Network
      </h1>
      <NetworkToggle />
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-lg-1-3 section--lg-split-left">
        <NodeStatus />
      </div>

      <div class="pure-u-1 pure-u-lg-2-3 section--lg-split-right network-top-right">
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
        <ChurnInfo />
      </div>
      <div class="pure-u-1 pure-u-md-1-2 section--split-right">
        <NodesByLocation />
      </div>
    </div>

    <NodeDetailList />

    <Footer />
  </div>
</template>

<script>
import fetchCommon from '../../lib/fetchCommon.mjs';
// import NodesByLocation from '../../components/Network/NodesByLocation.vue';
import ChurnInfo from '../../components/Network/ChurnInfo.vue';
import NodeDetailList from '../../components/Network/NodeDetailList.vue';

export default {
  // load data here
  components: {
    // NodesByLocation,
    NodeDetailList,
    ChurnInfo,
  },
  async fetch() {
    await fetchCommon(this, 'chaosnet');
  },
  mounted() {
    this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    this.$store.commit('nodeStarred/initializeStore');
  },
  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
  methods: {
    async pollData() {
      await this.$fetch();
      this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    },
  },
};
</script>

<style lang="scss" scoped>
.network-top-right {
  display: flex;
  flex-direction: column;
}
</style>
