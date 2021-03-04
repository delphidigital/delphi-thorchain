<template>
  <div>
    <ColumnChart
      :data="getBlockRewardsPerDayData"
      :format-label="formatLabel"
      :x-axis-categories="xAxisColumCategories"
      class="blockrewardsperday-chart"
    />
  </div>
</template>

<script>
// import { format, startOfMonth } from "date-fns";
import numeral from "numeral";
import ColumnChart from "../Thorchain/ColumnChart";

export default {
  components: { ColumnChart },
  data() {
    return {
      xAxisColumCategories: [
        "Bond Reward",
        "Pool Reward",
        "Block Reward"
      ],
    };
  },
  computed: {
    getBlockRewardsPerDayData() {
      return [{
        data: [
          { y: 50, color: '#19ceb8' },
          { y: 120, color: '#2d99fe' },
          { y: 170, color: '#4346D3' },
        ]
      }];
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
