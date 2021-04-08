<template>
  <div class="section__body volume-by-poolvstotal-section">
    <ColumnChart
      ref-name="vol_chart"
      :chart-data="chartData"
      :format-label="formatLabel"
      :format-label-axis="formatLabelAxis"
      :x-axis-options="xAxisOptions"
      :x-axis-categories="xAxisCategories"
      :custom-plot-options="customPlotOptions"
      :legend-options="customLegendOptions"
      :custom-chart-options="customChartOptions"
      class="blockrewardsperday-chart"
    />
  </div>
</template>

<script>
import { format, subDays, startOfDay, startOfWeek, startOfMonth, fromUnixTime, getUnixTime, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import numeral from "numeral";
import ColumnChart from "../Thorchain/ColumnChart";
import { periodsHistoryMap } from '../../store/pools';
import { poolNameWithoutAddr } from '../../lib/utils';
import { periodKeyToDaysMap } from '../../lib/ta';

export default {
  components: { ColumnChart },
  props: {
    currentTimeOption: {
      type: String,
      default: '1D', // VALUES: 1D, 1W, 1M
    },
  },
  data() {
    return {
      customChartOptions: {
        marginBottom: 120,
        height: 420,
        reflow: true,
        redraw: true,
      },
      customLegendOptions: {
        enabled: true,
        alignColumns: true
      },
      chartData: [],
      xAxisCategories: [],
      xAxisOptions: {
        // type: 'datetime',
        // labels: {
        //   formatter() {
        //     return new Date(this.value).toLocaleString('default', { month: 'short' })
        //   }
        // },
      },
      customPlotOptions: {
        column: {
          pointWidth: 26,
          borderWidth: 0,
          stacking: 'normal',
          dataLabels: {
            enabled: false
          },
        },
      },
    };
  },
  watch: {
    currentTimeOption: {
      // the callback will be called immediately after the start of the observation
      immediate: true, 
      handler (val, _oldVal) {
        const {
          chartData, allPoolsTimeKeys
        } = this.getChartData(val);
        this.chartData = chartData;
        this.xAxisCategories = allPoolsTimeKeys;
      }
    }
  },
  methods: {
    formatLabel(value) {
      return numeral(value).format("$0,0.0a").toUpperCase();
    },
    formatLabelAxis(value) {
      return numeral(value).format("$0,0a").toUpperCase();
    },
    getChartData(currentTimeOption) {
      // const period = periodsHistoryMap[currentTimeOption];
      const poolHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      const poolHistorySwaps = this.$store.state.pools.poolHistorySwaps;
      const periodToDaysMap = { '1D': 12, '1W': 12*7, '1M': 365 };
      const periodDataPoints = periodToDaysMap[currentTimeOption];
      const startAtPeriodUnixTime = getUnixTime(subDays(new Date(), periodDataPoints));
      const poolsDepths = Object.keys(poolHistoryDepths).map((poolId, _index) => {
        const intervals = poolHistoryDepths[poolId]['period1Y'].intervals.filter(iv => (
          parseInt(iv.startTime, 10) >= startAtPeriodUnixTime
        ));
        const reducedIntervals = [];
        let aggregationInterval = null;
        intervals.forEach(iv => {
          let startOfPeriod = startOfMonth;
          if (currentTimeOption === '1D') {
            startOfPeriod = startOfDay;
          } else if (currentTimeOption === '1W') {
            startOfPeriod = startOfWeek;
          }
          const startOfPeriodTime = `${getUnixTime(startOfPeriod(fromUnixTime(parseInt(iv.startTime, 10))))}`;
          if (!aggregationInterval) {
            aggregationInterval = {
              ...iv,
              startTime: startOfPeriodTime,
            };
          } else {
            const intervalDate = fromUnixTime(aggregationInterval.startTime);
            const nextDatapointDate = fromUnixTime(parseInt(iv.startTime, 10));
            let compareIfSamePeriod = isSameMonth;
            if (currentTimeOption === '1D') {
              compareIfSamePeriod = isSameDay;
            } else if (currentTimeOption === '1W') {
              compareIfSamePeriod = isSameWeek;
            }
            if (compareIfSamePeriod(intervalDate, nextDatapointDate)) {
              aggregationInterval = {
                assetDepth: iv.assetDepth,
                assetPrice: iv.assetPrice,
                assetPriceUSD: iv.assetPriceUSD,
                endTime: iv.endTime,
                liquidityUnits: iv.liquidityUnits,
                runeDepth: iv.runeDepth,
                startTime: aggregationInterval.startTime,
              };
            } else {
              reducedIntervals.push(aggregationInterval);
              aggregationInterval = {
                ...iv,
                startTime: startOfPeriodTime,
              };
            }
          }
        });
        reducedIntervals.push(aggregationInterval);
        return { poolId, intervals: reducedIntervals }
      });


      // poolId apy volumeAverageUsd depthAverageUsd volumeOverDepthRatio correllation
      // const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, period);
      // getInvervalsFromPeriodKey(this.$store.state.pools.poolHistorySwaps)
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const allPoolsSorted = poolsDepths.map(({ poolId, intervals }) => {
        const periodDailyData = poolHistorySwaps[poolId]['period1Y'].intervals.filter(iv => (
          parseInt(iv.startTime, 10) >= startAtPeriodUnixTime
        )).map((iv, _idx) => {
          return {
            totalVolume: parseInt(iv.totalVolume,10),
            startTime: iv.startTime
          };
        });
        const reducedIntervals = [];
        let aggregationInterval = null;
        periodDailyData.forEach(pd => {
          let startOfPeriod = startOfMonth;
          if (currentTimeOption === '1D') {
            startOfPeriod = startOfDay;
          } else if (currentTimeOption === '1W') {
            startOfPeriod = startOfWeek;
          }
          const startOfPeriodTime = `${getUnixTime(startOfPeriod(fromUnixTime(parseInt(pd.startTime, 10))))}`;
          if (!aggregationInterval) {
            aggregationInterval = { ...pd, startTime: startOfPeriodTime };
          } else {
            const intervalDate = fromUnixTime(aggregationInterval.startTime);
            const nextDatapointDate = fromUnixTime(pd.startTime);
            let compareIfSamePeriod = isSameMonth;
            if (currentTimeOption === '1D') {
              compareIfSamePeriod = isSameDay;
            } else if (currentTimeOption === '1W') {
              compareIfSamePeriod = isSameWeek;
            }
            if (compareIfSamePeriod(intervalDate, nextDatapointDate)) {
              aggregationInterval = {
                totalVolume: aggregationInterval.totalVolume + pd.totalVolume,
                startTime: aggregationInterval.startTime,
              };
            } else {
              reducedIntervals.push(aggregationInterval);
              aggregationInterval = { ...pd, startTime: startOfPeriodTime };
            }
          }
        });
        reducedIntervals.push(aggregationInterval);
        return { poolId, data: reducedIntervals };
      }).sort((a, b) => (
        parseInt(b.data[b.data.length-1]?.totalVolume || '0', 10) -
        parseInt(a.data[b.data.length-1]?.totalVolume || '0', 10)
      ));
      const top3PoolsSortedByVolume = allPoolsSorted.slice(0, 4);
      const allPoolsTimeMap = {};
      top3PoolsSortedByVolume.forEach(tp => {
        tp.data.forEach(dp => {
          if (!allPoolsTimeMap[dp.startTime]) {
            allPoolsTimeMap[dp.startTime] = true;
          }
        })
      });
      const otherPoolsSorted = allPoolsSorted.slice(4, allPoolsSorted.length);
      // create a map of time keys to a set of pools that provide data for that time key
      const otherPoolStartTimeMap = {};
      otherPoolsSorted.forEach(op => {
        op.data.forEach(dp => {
          if (!allPoolsTimeMap[dp.startTime]) {
            allPoolsTimeMap[dp.startTime] = true;
          }
          if (!otherPoolStartTimeMap[dp.startTime]) {
            otherPoolStartTimeMap[dp.startTime] = {
              poolIds: new Set(),
              totalVolume: 0,
            }
          }
          otherPoolStartTimeMap[dp.startTime].poolIds.add(op.poolId);
          otherPoolStartTimeMap[dp.startTime].totalVolume += parseInt(dp.totalVolume, 10)
        });
      });
      const other = {
        poolId: 'Other',
        data: Object.keys(otherPoolStartTimeMap).map(stKey => ({
          startTime: stKey,
          totalVolume: otherPoolStartTimeMap[stKey].totalVolume,
        })),
      }
      const colors = ["#f8c950", "#5e2bbc", "#2d99fe", "#3f9456", "#3f4456"];
      const allPoolsTimeKeys = Object.keys(allPoolsTimeMap)
        .map(k => parseInt(k, 10))
        .sort((a,b) => a-b)
        .map(p => format(new Date(parseInt(p, 10)*1000), 'dd MMM yyyy'));
      const chartData = [...top3PoolsSortedByVolume, other].map((pool, poolIdx) => {
        const pname = poolNameWithoutAddr(pool.poolId);
        return {
        color: colors[poolIdx],
        name: pname,
        data: pool.data.map((pd, dateIndex) => ({
          y: (pd.totalVolume / 10**8) * price,
          x: dateIndex,
          name: pname,
          color: colors[poolIdx],
        }))
        };
      });
      return { chartData, allPoolsTimeKeys };
    }
  },
};
</script>
<style lang="scss" scoped>
.volume-by-poolvstotal-section {
    @media screen and (max-width: $pureg-lg) {
    overflow-x: scroll;
  }
}
.blockrewardsperday-chart {
  border-top: 1px solid #353C50;
  padding: 15px 25px;
  min-width: 450px;
  :first-child {
    > .highcharts-container {
      text-align: center;
      align-items: center;
      align-content: center;
      margin: auto;
    }
  }
}
</style>
