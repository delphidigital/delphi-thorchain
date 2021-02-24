<template>
  <div class="section">
    <div class="section__header" id="pool-depth-volume">
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
      <a class="deeplink-selector" href="#pool-depth-volume">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
    </div>
    <div class="pure-g section__body section__body--pie-chart">
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumePieChart :top5PoolsWithOthers="top5PoolsWithOthers" />
      </div>
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumeTable
          :top5PoolsWithOthers="top5PoolsWithOthers"
          :totalPoolsDepthStats="totalPoolsDepthStats"
        />
      </div>
    </div>
    <hr class="section__divider">
    <div class="section__body--area-chart">
      <div class="section__chart-title">
        <h3 class="section__subtitle">
          Liquidity depth over time
        </h3>
        <div>
        <span
            class="liquidity-areachart-switch"
            name="chart-line"
            v-on:click="yAxisLabelOptions.type = 'logarithmic'"
            v-bind:class="[yAxisLabelOptions.type === 'logarithmic' ? 'active' : '']"
          >
            Log
          </span>
          <span
            class="liquidity-areachart-switch"
            name="chart-area"
            v-on:click="yAxisLabelOptions.type = 'linear'"
            v-bind:class="[yAxisLabelOptions.type === 'linear' ? 'active' : '']"
          >
            Linear
          </span>
        </div>
      </div>
      <AreaChart
        :data="liquidityDepthOverTime"
        :format-label="formatLabel"
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
import { periodsHistoryMap, runeDivider } from '../../store/pools';

const colors = [
  '#4346D3',
  '#5E2BBC',
  '#F7517F',
  '#2D99FF',
  '#16CEB9',
];

export default {
  components: {
    PoolDepthVolumePieChart,
    PoolDepthVolumeTable,
    AreaChart,
  },
  data() {
    return {
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
    }
  },
  computed: {
    top5PoolsWithOthers() {
      const allPoolsSorted = Object.keys(this.$store.state.pools.technicalAnalysis).map((poolId, index) => {
        const period = periodsHistoryMap[this.currentTimeOption];
        const poolPeriodTA = this.$store.state.pools.technicalAnalysis[poolId][period];
        return {
          ...poolPeriodTA,
          poolId,
          color: colors[index % (colors.length)],
        };
      }).sort((a, b) => b.totalDepthUsd - a.totalDepthUsd);
      const top5PoolsSortedByVolume = allPoolsSorted.slice(0, 5);
      const otherPoolsSorted = allPoolsSorted.slice(5, allPoolsSorted.length);
      const other = otherPoolsSorted.reduce((result, item) => {
        return {
          ...result,
          averageAssetPriceUsd: result.averageAssetPriceUsd + item.averageAssetPriceUsd,
          averageEarningsRune: result.averageEarningsRune + item.averageEarningsRune,
          averageRunePriceUsd: result.averageRunePriceUsd + item.averageRunePriceUsd,
          depthAverage: result.depthAverage + item.depthAverage,
          depthAverageUsd: result.depthAverageUsd + item.depthAverageUsd,
          // intervals: todo: combine intervals
          totalDepth: result.totalDepth + item.totalDepth,
          totalDepthUsd: result.totalDepthUsd + item.totalDepthUsd,
          totalEarningsRune: result.totalEarningsRune + item.totalEarningsRune,
          totalVolume: result.totalVolume + item.totalVolume,
          totalVolumeUsd: result.totalVolumeUsd + item.totalVolumeUsd,
          volumeAverage: result.volumeAverage + item.volumeAverage,
          volumeAverageUsd: result.volumeAverageUsd + item.volumeAverageUsd,
        };
      }, {
        poolId: 'Other',
        averageAssetPriceUsd: 0.0,
        averageEarningsRune: 0.0,
        averageRunePriceUsd: 0.0,
        depthAverage: 0.0,
        depthAverageUsd: 0.0,
        // intervals: {},
        totalDepth: 0.0,
        totalDepthUsd: 0.0,
        totalEarningsRune: 0.0,
        totalVolume: 0.0,
        totalVolumeUsd: 0.0,
        volumeAverage: 0.0,
        volumeAverageUsd: 0.0,
        color: '#3F4357',
      });
      other.depthAverage = other.depthAverage
        ? other.depthAverage / otherPoolsSorted.length
        : 0;
      other.depthAverageUsd = other.depthAverageUsd
        ? other.depthAverageUsd / otherPoolsSorted.length
        : 0;
      other.volumeAverage = other.volumeAverage
        ? other.volumeAverage / otherPoolsSorted.length
        : 0;
      other.volumeAverageUsd = other.volumeAverageUsd
        ? other.volumeAverageUsd / otherPoolsSorted.length
        : 0;
      return [...top5PoolsSortedByVolume, other];
    },
    liquidityDepthOverTime() {
      const allPoolsHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      const period = periodsHistoryMap[this.currentTimeOption];
      const allPoolsIntervals = Object.keys(allPoolsHistoryDepths).map((poolId) => {
        const poolHistoryDepths = allPoolsHistoryDepths[poolId];
        const poolPeriodHD = poolHistoryDepths ? poolHistoryDepths[period] : undefined;
        return (poolPeriodHD?.intervals || []).map(iv => {
          const assetPriceUsd = parseFloat(iv.assetPriceUSD);
          const assetPrice = parseFloat(iv.assetPrice);
          const runePriceUsd = isNaN(assetPriceUsd) || isNaN(assetPrice) || !assetPrice ? 0 : (assetPriceUsd / assetPrice);
          const runeDepthUsd = runePriceUsd * (parseInt(iv.runeDepth,10)/runeDivider);
          return {
            ...iv,
            runePriceUsd,
            runeDepthUsd,
          }
        });
      });
      // combine all pools, by each interval, so we have a series of the sum all pools in intervals
      const combinedIntervals = allPoolsIntervals && allPoolsIntervals.length
        ? allPoolsIntervals.reduce((intervals1, intervals2) => {
          let firstIntervals = intervals1;
          let secondIntervals = intervals2;
          if (intervals1.length < intervals2.length) {
            firstIntervals = intervals2;
            secondIntervals = intervals1;
          }
          return firstIntervals.map((item, idx) => {
            const runeDepth1 = (parseFloat(item.runeDepth) || 0);
            const runeDepth2 = secondIntervals[idx]
              ? (parseFloat(secondIntervals[idx].runeDepth) || 0)
              : 0;
            const runeDepth = runeDepth1 + runeDepth2;
            const runeDepthUsd = item.runeDepthUsd + secondIntervals[idx].runeDepthUsd;
            return { runeDepth, runeDepthUsd, startTime: item.startTime };
          });
        })
        : [];
      return combinedIntervals.map(val => ({
        date: new Date(parseInt(val.startTime, 10)*1000),
        value: (val.runeDepthUsd * 2),
      }));
    },
    totalPoolsDepthStats() {
      const period = periodsHistoryMap[this.currentTimeOption];
      return Object.keys(this.$store.state.pools.technicalAnalysis).reduce((result, poolId) => {
        const item = this.$store.state.pools.technicalAnalysis[poolId];
        return {
          depthAverage: result.depthAverage + item[period].depthAverage,
          depthAverageUsd: result.depthAverageUsd + item[period].depthAverageUsd,
          totalDepth: result.totalDepth + item[period].totalDepth,
          totalDepthUsd: result.totalDepthUsd + item[period].totalDepthUsd,
        };
      }, {
        depthAverage: 0.0,
        depthAverageUsd: 0.0,
        totalDepth: 0.0,
        totalDepthUsd: 0.0,
      });
    },
  },
  methods: {
    togglePeriod(period) {
      if (this.currentTimeOption !== period) {
        this.currentTimeOption = period;
      }
    },
    formatLabel(value) {
      return numeral(value).format('($0,0a)').toUpperCase();
    }
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
  padding: 4px 6px;
  cursor: pointer;
  font-size: 11px;
  margin-right: 8px;
  font-weight: 500;
}
.liquidity-areachart-switch.active {
  background-color: transparent;
  background-color:rgba(51, 63, 101, .7);
  cursor: auto;
}
</style>