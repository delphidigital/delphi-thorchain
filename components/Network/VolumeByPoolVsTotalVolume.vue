<template>
  <div>
    <ColumnChart
      :data="chartData"
      :format-label="formatLabel"
      :x-axis-options="xAxisOptions"
      :x-axis-categories="xAxisCategories"
      :custom-plot-options="customPlotOptions"
      :legend-options="customLegendOptions"
      class="blockrewardsperday-chart"
    />
  </div>
</template>

<script>
import { subDays, format } from "date-fns";
import numeral from "numeral";
import ColumnChart from "../Thorchain/ColumnChart";
import { periodsHistoryMap } from '../../store/pools';
export default {
  components: { ColumnChart },
  data() {

      const _this = this;
      const price = _this.$store.state.runeMarketData && _this.$store.state.runeMarketData.priceUSD || 0;
      const allPoolsSorted = Object.keys(_this.$store.state.pools.poolHistorySwaps).map((poolId, index) => {
        const period = periodsHistoryMap['1W'];
        let data = [];
        if (this.$store.state.pools.poolHistorySwaps[poolId][period]) {
          data = this.$store.state.pools.poolHistorySwaps[poolId][period].intervals.map((iv, idx) => {
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
        parseInt(b.data[b.data.length-2]?.totalVolume || '0', 10) -
        parseInt(a.data[b.data.length-2]?.totalVolume || '0', 10)
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
          color: colors[poolIdx]
        }))
        };
      });
    return {
      // allPoolsTimeKeys: tt.allPoolsTimeKeys,
      // chartData: tt.chartData,
      customLegendOptions: {
        enabled: true,
      },
      // xAxisColumCategories: [
      //   format(subDays(new Date(), 0), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 1), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 2), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 3), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 4), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 5), 'dd MMM yyyy'),
      //   format(subDays(new Date(), 6), 'dd MMM yyyy'),
      // ],
      chartData,
      xAxisCategories: allPoolsTimeKeys,
      xAxisOptions: {
        type: 'datetime',
      },
      currentTimeOption: '1W',
      timeOptions: ['1W', '1M'],
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
  computed: {
    getVolumeByPoolVsTotalVolume() {
      return [
        {
          data: [
            { y: 2, x: 0, name: "BNB", color: "#f8c950" },
            { y: 8, x: 1, name: "BNB", color: "#f8c950" },
            { y: 9, x: 2, name: "BNB", color: "#f8c950" },
            { y: 3, x: 3, name: "BNB", color: "#f8c950" },
            { y: 5, x: 4, name: "BNB", color: "#f8c950" },
            { y: 7, x: 5, name: "BNB", color: "#f8c950" },
            { y: 3, x: 6, name: "BNB", color: "#f8c950" },
          ]
        },
        {
            data: [
              { y: 5, x: 0, name: "ETH", color: "#5e2bbc" },
              { y: 3, x: 1, name: "ETH", color: "#5e2bbc" },
              { y: 4, x: 2, name: "ETH", color: "#5e2bbc" },
              { y: 7, x: 3, name: "ETH", color: "#5e2bbc" },
              { y: 4, x: 4, name: "ETH", color: "#5e2bbc" },
              { y: 7, x: 5, name: "ETH", color: "#5e2bbc" },
              { y: 4, x: 6, name: "ETH", color: "#5e2bbc" },
            ]
        },
        {
          data: [
            { y: 1, x: 0, name: "BTC", color: "#2d99fe" },
            { y: 12, x: 1, name: "BTC", color: "#2d99fe"  },
            { y: 3, x: 2, name: "BTC", color: "#2d99fe"  },
            { y: 7, x: 3, name: "BTC", color: "#2d99fe" },
            { y: 5, x: 4, name: "BTC", color: "#2d99fe"  },
            { y: 4, x: 5, name: "BTC", color: "#2d99fe"  },
            { y: 7, x: 6, name: "BTC", color: "#2d99fe" },
          ]
        },
        {
          data: [
            { y: 5, x: 0, name: "Other", color: "#3f4456" },
            { y: 3, x: 1, name: "Other", color: "#3f4456" },
            { y: 4, x: 2, name: "Other", color: "#3f4456" },
            { y: 7, x: 3, name: "Other", color: "#3f4456" },
            { y: 3, x: 4, name: "Other", color: "#3f4456" },
            { y: 4, x: 5, name: "Other", color: "#3f4456" },
            { y: 7, x: 6, name: "Other", color: "#3f4456" },
          ]
        },
      ];
    },
  },
  methods: {
    formatLabel(value) {
      return numeral(value).format("$0,0.000a").toUpperCase();
    },
  },
};
</script>
<style lang="scss" scoped>
.blockrewardsperday-chart {
    border-top: 1px solid #353C50;
    padding: 15px 25px;
}
</style>
