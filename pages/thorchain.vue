<template>
  <div class="page__container">
    <div class="page__header">
      <h1 class="page__title">
        Dashboard
      </h1>
      <NetworkToggle />
    </div>

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
        <PoolList />
      </div>
      <div class="pure-u-1 pure-u-lg-1-3 section--lg-split-right">
        <StandbyPools />
      </div>
    </div>

    <NodeSummary />

    <Footer />
  </div>
</template>

<script>
import {
  loadPools,
  loadPoolDetail,
  loadMarketData,
  loadConstants,
  loadNodeAccounts,
  loadNetwork,
  loadLastBlock,
  loadMimir,
  loadAsgardVaults,
} from '../lib/api.mjs';
import Footer from '../components/Footer.vue';
import PoolDepthSummary from '../components/PoolDepthSummary.vue';
import PercentageRuneLocked from '../components/PercentageRuneLocked.vue';
import NodeSummary from '../components/NodeSummary.vue';

export default {
  // load data here
  components: {
    Footer,
    PercentageRuneLocked,
    PoolDepthSummary,
    NodeSummary,
  },
  async fetch() {
    const poolIds = await loadPools({
      axios: this.$axios,
    });
    this.$store.commit('pools/setPoolIds', poolIds);

    await Promise.all(poolIds.map(async (poolId) => {
      const poolDetail = await loadPoolDetail({
        axios: this.$axios,
        poolId,
      });
      this.$store.commit('pools/setPoolDetail', { poolId, poolDetail: poolDetail[0] });
    }));

    const nodeAccounts = await loadNodeAccounts({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNodeAccounts', nodeAccounts);

    const lastBlock = await loadLastBlock({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setLastBlock', lastBlock.thorchain);

    const mimir = await loadMimir({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setMinBond', mimir['mimir//MINIMUMBONDINRUNE']);

    const asgardVaults = await loadAsgardVaults({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setAsgardVaults', asgardVaults);

    const network = await loadNetwork({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNextChurnHeight', network.nextChurnHeight);

    const marketData = await loadMarketData({
      axios: this.$axios,
    });
    this.$store.commit('runeMarketData/setData', marketData);

    const constants = await loadConstants({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setOldValidatorRate', constants['int_64_values'].OldValidatorRate);
    this.$store.commit('nodes/setRotatePerBlockHeight', constants['int_64_values'].RotatePerBlockHeight);
  },
  mounted() {
    this.pollData();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    pollData() {
      this.polling = setInterval(() => {
        this.$fetch();
      }, process.env.pollingFrequency);
    },
  },
};
</script>

