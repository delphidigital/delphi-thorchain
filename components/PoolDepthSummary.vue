<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Pool depth & volume
      </h2>
    </div>
    <div class="pure-g section__body">
      <div class="pure-u-2-5">
        <PoolDepthVolumePieChart />
      </div>
      <div class="pure-u-3-5">
        <PoolDepthVolumeTable />
      </div>
    </div>
    <hr class="section__divider">
    <div class="section__body">
      <h3 class="section__subtitle">
        Liquidity depth over time
      </h3>
      <AreaChart :data="liquidityDepthOverTime" :format-label="e => `$${e}`" />
    </div>
  </div>
</template>

<script>
import PoolDepthVolumePieChart from './PoolDepthVolumePieChart.vue';
import PoolDepthVolumeTable from './PoolDepthVolumeTable.vue';
import AreaChart from './AreaChart.vue';

export default {
  components: {
    PoolDepthVolumePieChart,
    PoolDepthVolumeTable,
    AreaChart,
  },
  computed: {
    liquidityDepthOverTime() {
      return this.$store.state.timeSeries.liquidityDepthOverTime;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
