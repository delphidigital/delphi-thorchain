<template>
  <div class="container">
    <div>
      <h1 class="title">
        delphi-thorchain
      </h1>
      <PoolDepthSummary />
      <PercentageRuneLocked />
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
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
