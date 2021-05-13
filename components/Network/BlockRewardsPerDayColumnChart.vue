<template>
  <div style="max-width: 520px; margin: auto;">
    <ColumnChart
      :chart-data="getBlockRewardsPerDayData"
      :format-label="formatLabel"
      :format-label-axis="formatLabelAxis"
      :x-axis-categories="xAxisColumCategories"
      :custom-chart-options="customChartOptions"
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
      customChartOptions: {
        height: 420,
        width: 470,
      },
      xAxisColumCategories: [
        "Bond Reward",
        "Pool Reward",
        "Total Rewards"
      ],
    };
  },
  computed: {
    getBlockRewardsPerDayData() {
      const blocksPerYear = this.$store.state.nodes.constants?.int_64_values?.BlocksPerYear || 0;
      const blocksPerDay = blocksPerYear/365;
      const runeDivider = 10 ** 8;
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const bondReward = (this.$store.state.networkHealth.network.blockRewards.bondReward / runeDivider) * price * blocksPerDay;
      const poolReward = (this.$store.state.networkHealth.network.blockRewards.poolReward / runeDivider) * price * blocksPerDay;
      const blockReward = (this.$store.state.networkHealth.network.blockRewards.blockReward / runeDivider) * price * blocksPerDay; 
      return [{
        data: [
          { y: bondReward, color: '#19ceb8' },
          { y: poolReward, color: '#2d99fe' },
          { y: blockReward, color: '#4346D3' },
        ]
      }];
    },
  },
  methods: {
    formatLabel(value) {
      return numeral(value).format("$0,0.0a").toUpperCase();
    },
    formatLabelAxis(value) {
      return numeral(value).format("$0,0a").toUpperCase();
    },
  },
};
</script>
<style lang="scss" scoped>
.blockrewardsperday-chart {
    border-top: 1px solid #353C50;
    padding: 15px 25px;
    max-width: inherit;
    width: inherit;
    margin: auto;
    min-width: 500px;
}
</style>
