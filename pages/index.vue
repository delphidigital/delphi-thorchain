<template>
  <div class="container">
    <div class="dashboard__header">
      <h1 class="title">
        Dashboard
      </h1>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-2">
        <PoolDepthSummary />
      </div>
      <div class="pure-u-1 pure-u-md-1-2">
        <PercentageRuneLocked />
      </div>
    </div>
  </div>
</template>

<script>
import { loadPools, loadPoolDetail, loadNodeAccounts } from '../lib/api.mjs';
import PoolDepthSummary from '../components/PoolDepthSummary.vue';
import PercentageRuneLocked from '../components/PercentageRuneLocked.vue';

export default {
  // load data here
  components: {
    PercentageRuneLocked,
    PoolDepthSummary,
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
      this.$store.commit('pools/setPoolDetail', { poolId, poolDetail });
    }));

    const nodeAccounts = await loadNodeAccounts({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNodeAccounts', nodeAccounts);
  },
};
</script>

<style>
</style>
