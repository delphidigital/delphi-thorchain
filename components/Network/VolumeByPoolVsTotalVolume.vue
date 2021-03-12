<template>
  <div>
    <ColumnChart
      ref-name="vol_chart"
      :chart-data="chartData"
      :format-label="formatLabel"
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
import { format } from "date-fns";
import numeral from "numeral";
import ColumnChart from "../Thorchain/ColumnChart";
import { periodsHistoryMap } from '../../store/pools';
export default {
  components: { ColumnChart },
  props: {
    currentTimeOption: {
      type: String,
      default: '1W',
    },
  },
  data() {
    return {
      customChartOptions: {
        marginBottom: 120,
        height: 370,
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
      return numeral(value).format("$0,0.000a").toUpperCase();
    },
    getChartData(currentTimeOption) {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const allPoolsSorted = Object.keys(this.$store.state.pools.poolHistorySwaps).map((poolId, _index) => {
        const period = periodsHistoryMap[currentTimeOption];
        let data = [];
        if (this.$store.state.pools.poolHistorySwaps[poolId][period]) {
          data = this.$store.state.pools.poolHistorySwaps[poolId][period].intervals.map((iv, _idx) => {
            return {
              totalVolume: parseInt(iv.totalVolume,10),
              startTime: iv.startTime
            };
          });
        }
        return {
          poolId,
          data,
        };
      }).sort((a, b) => (
        parseInt(b.data[b.data.length-1]?.totalVolume || '0', 10) -
        parseInt(a.data[b.data.length-1]?.totalVolume || '0', 10)
      ));
      // calculate other pools payload
      const top3PoolsSortedByVolume = allPoolsSorted.slice(0, 3);
      const allPoolsTimeMap = {};
      top3PoolsSortedByVolume.forEach(tp => {
        tp.data.forEach(dp => {
          if (!allPoolsTimeMap[dp.startTime]) {
            allPoolsTimeMap[dp.startTime] = true;
          }
        })
      });
      const otherPoolsSorted = allPoolsSorted.slice(3, allPoolsSorted.length);
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
      const colors = [
        "#f8c950",
        "#5e2bbc",
        "#2d99fe",
        "#3f4456",
      ];
      const allPoolsTimeKeys = Object.keys(allPoolsTimeMap)
        .map(k => parseInt(k, 10))
        .sort((a,b) => a-b)
        .map(p => format(new Date(parseInt(p, 10)*1000), 'dd MMM yyyy'));
      const chartData = [...top3PoolsSortedByVolume, other].map((pool, poolIdx) => {
        return {
        color: colors[poolIdx],
        name: pool.poolId,
        data: pool.data.map((pd, dateIndex) => ({
          y: (pd.totalVolume / 10**8) * price,
          x: dateIndex,
          name: pool.poolId,
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
.blockrewardsperday-chart {
  border-top: 1px solid #353C50;
  padding: 15px 25px;
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
