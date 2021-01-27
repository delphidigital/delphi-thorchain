<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Pool depth & volume
      </h2>
    </div>
    <div class="pure-g section__body section__body--pie-chart">
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumePieChart />
      </div>
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumeTable />
      </div>
    </div>
    <hr class="section__divider">
    <div class="section__body--area-chart">
      <div class="section__chart-title">
        <h3 class="section__subtitle">
          Liquidity depth over time
        </h3>
        <div>
          <span>
            <Icon name="chart-area" v-on:click="yAxisLabelOptions.type = 'linear'"></Icon>
          </span>
          <span>
            <Icon name="chart-line" v-on:click="yAxisLabelOptions.type = 'logarithmic'"></Icon>
          </span>
        </div>
      </div>
      <AreaChart
        :data="liquidityDepthOverTime"
        :format-label="e => `$${e}`"
        :y-axis-label-options="yAxisLabelOptions"
      />
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
  data: () => ({
    yAxisLabelOptions: {
      type: 'linear', // 'logarithmic',
      title: {
        text: 'Liquidity',
        useHTML: true,
        style: {
          color: 'rgba(255,255,255,0.7)',
        }
      },
    }
  }),
  computed: {
    liquidityDepthOverTime() {
      return this.$store.state.timeSeries.liquidityDepthOverTime;
    },
  },
};
</script>

<style lang="scss">
.section__chart-title {
  display: flex;
  flex-direction: row;
}
.section__chart-title > .section__subtitle {
  flex: 1;
}
</style>