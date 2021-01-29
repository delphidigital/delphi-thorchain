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
        <!-- <pre>
          {{currentTimeOption}}
        </pre> -->
        <div>
          <span>
            <Icon
              class="liquidity-areachart-switch"
              name="chart-area"
              v-on:click="yAxisLabelOptions.type = 'linear'"
              v-bind:class="[yAxisLabelOptions.type === 'linear' ? 'active' : '']"
            >
            </Icon>
          </span>
          <span>
            <Icon
              class="liquidity-areachart-switch"
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
import numeral from 'numeral';
import PoolDepthVolumePieChart from './PoolDepthVolumePieChart.vue';
import PoolDepthVolumeTable from './PoolDepthVolumeTable.vue';
import AreaChart from './AreaChart.vue';

export default {
  components: {
    PoolDepthVolumePieChart,
    PoolDepthVolumeTable,
    AreaChart,
  },
  data() {
    return {
      timeOptions: ['1M', '3M', '1Y'],
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
    }
  },
  computed: {
    currentTimeOption() {
      const periodsMap = { period30d: '1M', period90d: '3M', period365d: '1Y' };
      const period = this.$store.state.pools.periodDepthAndVolume || 'period30d';
      return periodsMap[period];
    },
    liquidityDepthOverTime() {
      const dataPoints = this.$store.getters['pools/liquidityDepthOverTime'];
      const priceUSD = this.$store.state.runeMarketData.priceUSD;
      return dataPoints.map(dp => ({
        value: dp.value * priceUSD,
        date: dp.date,
      }));
    },
    poolsHistoryDepth() {
      return JSON.stringify(
        this.$store.getters['pools/poolHistoryDepths'],
        null,
        2
      );
    },
  },
  methods: {
    togglePeriod(period) {
      const optionsMap = { '1M': 'period30d', '3M': 'period90d', '1Y': 'period365d' };
      const currentPeriod = this.$store.state.pools.periodDepthAndVolume
      if (currentPeriod !== optionsMap[period] && optionsMap[period]) {
        this.$store.commit('pools/togglePeriodDepthAndVolume', optionsMap[period]);
      }
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

.liquidity-areachart-switch {
  border: 2px solid rgba(51, 63, 101, .7);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
}
.liquidity-areachart-switch.active {
  background-color: transparent;
  background-color:rgba(51, 63, 101, .7);
  cursor: auto;
}
</style>