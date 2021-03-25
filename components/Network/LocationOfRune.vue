<template>
  <div>
    <AppHighchart :chart-options="chartOptions" :placeholder-height="320" />
  </div>
</template>

<script>
// import numeral from 'numeral';
import Treemap from "highcharts/modules/treemap";
import Highcharts from "highcharts";
import AppHighchart from "../Common/AppHighchart.vue";

export default {
  components: {
    AppHighchart,
  },
  props: {
    // chartData: {
    //   type: Array,
    //   default: () => [],
    // },
    // deterministicRunePrice: {
    //   type: Number,
    //   default: () => 0,
    // },
    // speculativeMultiplier: {
    //   type: Number,
    //   default: () => 0,
    // },
  },
  beforeMount() {
    Treemap(Highcharts);
  },
  computed: {
    chartOptions() {
      const coingeckoMarketData = this.$store.state.runeMarketData
        .coingeckoMarketData;
      const pooledPlusBonded = this.$store.state.runeMarketData
        .circulatingSupply;
      const net = this.$store.state.networkHealth.network;
      const bm = net.bondMetrics;
      // TODO: use actual testnet circulating supply for now uses the highest value between
      //       coingecko circulating supply or the sum of pooled+bonded
      // const totalSupply = coingeckoMarketData.total_supply;
      // const circulatingSupply = pooledPlusBonded > coingeckoMarketData.circulating_supply
      //   ? pooledPlusBonded
      //   : coingeckoMarketData.circulating_supply;
      const circulatingSupply = pooledPlusBonded;
      const totalSupply = circulatingSupply;

      const supActiveBonded =
        bm.totalActiveBond && bm.totalActiveBond !== "0"
          ? parseInt(bm.totalActiveBond, 10) / 10 ** 8
          : 0;
      const supSandbyBonded =
        bm.totalStandbyBond && bm.totalStandbyBond !== "0"
          ? parseInt(bm.totalStandbyBond, 10) / 10 ** 8
          : 0;
      const totalBonded = supActiveBonded + supSandbyBonded;
      const supPooled =
        net.totalPooledRune && net.totalPooledRune !== "0"
          ? parseInt(net.totalPooledRune, 10) / 10 ** 8
          : 0;
      const supUnlocked = circulatingSupply - (totalBonded + supPooled);
      const supUnreleased = totalSupply - circulatingSupply;
      const supReserve =
        net.totalReserve && net.totalReserve !== "0"
          ? parseInt(net.totalReserve, 10) / 10 ** 8
          : 0;

      return {
        chart: {
          backgroundColor: "transparent",
          height: 320,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: "",
        },
        tooltip: {
          enabled: false,
        },
        labels: false,
        credits: false,
        levels: [
          {
            level: 1,
            dataLabels: {
              enabled: true,
            },
            borderWidth: 3,
          },
        ],
        series: [
          {
            type: "treemap",
            // layoutStartingDirection: '',
            // alternateStartingDirection: true,
            layoutAlgorithm: "strip",
            // allowDrillToNode: true,
            // levelIsConstant: true,
            data: [
              {
                name: 'Unlocked',
                value: supUnlocked,
                color: '#3f4456',
                sortIndex: 0,
              }, {
                name: 'Unreleased supply',
                value: supUnreleased,
                color: '#4346d3',
                sortIndex: 2,
              }, {
                name: 'Reserve',
                value: supReserve,
                color: '#19ceb8',
                sortIndex: 3,
              }, {
                name: 'Standby Bonded',
                value: supSandbyBonded,
                color: '#5e2bbc',
                sortIndex: 1,
              }, {
                name: 'Pooled',
                value: supPooled,
                color: '#f8c950',
                sortIndex: 1,
              }, {
                name: 'Active Bonded',
                value: supActiveBonded,
                color: '#2d99fe',
                sortIndex: 1,
              },
            ]
          },
        ],
      };
    },
  },
};
</script>

<style>
.chart-placeholder {
  height: 320px;
}
</style>
