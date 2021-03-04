<template>
  <div>
    <ColumnChart
      :data="getVolumeByPoolVsTotalVolume"
      :format-label="formatLabel"
      :x-axis-options="xAxisOptions"
      :x-axis-categories="xAxisColumCategories"
      :custom-plot-options="customPlotOptions"
      class="blockrewardsperday-chart"
    />
  </div>
</template>

<script>
import { subDays, format } from "date-fns";
import numeral from "numeral";
import ColumnChart from "../Thorchain/ColumnChart";

export default {
  components: { ColumnChart },
  data() {
    return {
      xAxisColumCategories: [
        format(subDays(new Date(), 0), 'dd MMM yyyy'),
        format(subDays(new Date(), 1), 'dd MMM yyyy'),
        format(subDays(new Date(), 2), 'dd MMM yyyy'),
        format(subDays(new Date(), 3), 'dd MMM yyyy'),
        format(subDays(new Date(), 4), 'dd MMM yyyy'),
        format(subDays(new Date(), 5), 'dd MMM yyyy'),
        format(subDays(new Date(), 6), 'dd MMM yyyy'),
      ],
      xAxisOptions: {
        type: 'datetime',
      },
      customPlotOptions: {
        column: {
          pointWidth: 26,
          borderWidth: 0,
          stacking: 'normal',
          dataLabels: {
            enabled: true
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
