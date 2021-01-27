<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Pool depth & volume
      </h2>
       <div class="pool-depth-time-selector">
        <button
          v-for="option in timeOptions"
          :key="option"
          class="pool-depth-time-option"
          :class="{ 'pool-depth-time-option--active': option === currentTimeOption }"
          @click="togglePeriod(option)"
        >
          {{ option }}
        </button>
      </div>
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
            <Icon
              class="liquidity-areachart"
              name="chart-area"
              v-on:click="yAxisLabelOptions.type = 'linear'"
              v-bind:class="[yAxisLabelOptions.type === 'linear' ? 'active' : '']"
            >
            </Icon>
          </span>
          <span>
            <Icon
              class="liquidity-areachart"
              name="chart-line"
              v-on:click="yAxisLabelOptions.type = 'logarithmic'"
              v-bind:class="[yAxisLabelOptions.type === 'logarithmic' ? 'active' : '']"
            >
            </Icon>
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
    timeOptions: ['1M', '3M', '1Y'],
    currentTimeOption: '1M',
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
    methods: {
    togglePeriod(period) {
      // TODO: maybe each component should use a different period toggle?
      this.currentTimeOption = period;
    },
  },
};
</script>

<style lang="scss">
.pool-depth-time-selector {
  display: flex;
  height: 30px;
  margin-left: 20px;
  opacity: 0.6;
  justify-content: space-between;
  background-color: $color-bg-tint;
  border-radius: 15px;
  padding: 0 16px;
    margin-right: 16px;
}

.pool-depth-time-option {
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  background-color: transparent;
  border: none;
  margin: 0;
  padding: 0;
  padding-right: 8px;
  &:last-child { padding-right: 0; }
  &:hover, &:focus {
    border: none;
    outline: none;
  }
  &.pool-depth-time-option--active {
    color: #fff;
  }
}

.section__chart-title {
  display: flex;
  flex-direction: row;
  .section__subtitle { flex: 1; }
}

.liquidity-areachart {
  border: 2px solid rgba(51, 63, 101, .7);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  padding: 4px;
}
.liquidity-areachart.active {
  background-color: transparent;
  background-color:rgba(51, 63, 101, .7);
}
</style>