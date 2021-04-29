<template>
  <div class="section">
    <div class="section__header" id="pool-depth-volume">
      <h2 class="section__title">
        Pool depth & volume
        <span class="section__title--tooltip">
          <Icon
            class="tooltip__hover--info"
            name="info"
            scale="0.4"
          >
          </Icon>
          <div class="app-tooltip section__title__tooltip">
            <div class="app-tooltip__body">
              An overview of the deepest pools and their respective total volume over the selected period.
            </div>
          </div>
        </span>
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
      <a class="tweet__link" :href="tweetPoolDepthSummary" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
    </div>
    <div class="pure-g section__body section__body--pie-chart">
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumePieChart :top5PoolsWithOthers="top5PoolsWithOthers" />
      </div>
      <div class="pure-u-lg-1-2 pure-u-1">
        <PoolDepthVolumeTable :top5PoolsWithOthers="top5PoolsWithOthers" />
      </div>
    </div>
    <hr class="section__divider">
    <div class="section__body--area-chart">
      <div class="section__chart-title">
        <h3 class="section__subtitle">
          Liquidity Over Time
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
import { getPoolsPeriodDepthAndVolumeUsd, getInvervalsFromPeriodKey } from '../../lib/ta';
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
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const poolDepthAndVolumeLink = `${baseUrl}${tabBasePath}#pool-depth-volume`;
    return {
      tweetPoolDepthSummary: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Pool depth and volume')}&url=${encodeURIComponent(poolDepthAndVolumeLink)}`,
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
    poolsPeriodDepthAndVolumeUsd() {
      const poolHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      const poolHistorySwaps = this.$store.state.pools.poolHistorySwaps;
      const periodKey = periodsHistoryMap[this.currentTimeOption];
      const allPools = getPoolsPeriodDepthAndVolumeUsd(poolHistoryDepths, poolHistorySwaps, periodKey, colors);
      return allPools;
    },
    top5PoolsWithOthers() {
      const allPools = this.poolsPeriodDepthAndVolumeUsd;
      const allPoolsSorted = allPools.slice().sort((a, b) => b.totalDepthUsd - a.totalDepthUsd);
      const top5PoolsSortedByVolume = allPoolsSorted.slice(0, 5);
      const otherPoolsSorted = allPoolsSorted.slice(5, allPoolsSorted.length);
      const other = otherPoolsSorted.reduce((result, item) => {
        return {
          ...result,
          totalDepthUsd: result.totalDepthUsd + item.totalDepthUsd,
          totalVolumeUsd: result.totalVolumeUsd + item.totalVolumeUsd,
        };
      }, {
        poolId: 'Other',
        totalDepthUsd: 0.0,
        totalVolumeUsd: 0.0,
        color: '#3F4357',
      });
      return [...top5PoolsSortedByVolume, other];
    },
    liquidityDepthOverTime() {
      const allPoolsHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      const period = periodsHistoryMap[this.currentTimeOption];
      const periodHistoryDepths = getInvervalsFromPeriodKey(allPoolsHistoryDepths, period);
      const allPoolsIntervals = periodHistoryDepths.map((periodPoolHistory) => {
        return periodPoolHistory.intervals.map(iv => {
          const assetPriceUsd = isNaN(parseFloat(iv.assetPriceUSD)) ? 0 : parseFloat(iv.assetPriceUSD);
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
            const runeDepthUsd = item.runeDepthUsd + (secondIntervals[idx]?.runeDepthUsd || 0);
            return { runeDepth, runeDepthUsd, startTime: item.startTime };
          });
        })
        : [];
      return combinedIntervals.map(val => ({
        date: new Date(parseInt(val.startTime, 10)*1000),
        value: (val.runeDepthUsd * 2),
      }));
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

  @media screen and (max-width: $pureg-lg) {
    height: 30px; margin-left: 10px; padding: 0 8px; margin-right: 10px;
  }
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