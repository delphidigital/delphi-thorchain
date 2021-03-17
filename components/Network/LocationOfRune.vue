<template>
  <div>
    <AppHighchart :chart-options="chartOptions" :placeholder-height="320" />
  </div>
</template>

<script>
// import numeral from 'numeral';
import Treemap from 'highcharts/modules/treemap'
import Highcharts from 'highcharts';
import AppHighchart from '../Common/AppHighchart.vue';

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
  beforeMount(){
    Treemap(Highcharts);
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          backgroundColor: 'transparent',
          height: 320,
          margin: [0, 0, 0, 0],
        },
        title: {
            text: '',
        },
        tooltip: {
          enabled: false,
        },
        labels: false,
        credits: false,
        series: [{
            type: 'treemap',
            alternateStartingDirection: true,
            layoutAlgorithm: 'squarified',
            data: [{
                name: 'Unlocked',
                value: 30,
                color: '#3f4456',
                sortIndex: 0,
                }, {
                name: 'Active Bonded',
                value: 10,
                color: '#2d99fe',
                sortIndex: 1,
                }, {
                name: 'Standby Bonded',
                value: 2,
                color: '#5e2bbc',
                sortIndex: 1,
                }, {
                name: 'Pooled',
                value: 3,
                color: '#f8c950',
                sortIndex: 1,
                }, {
                name: 'Reserve',
                value: 1,
                color: '#19ceb8',
                sortIndex: 2,
                }, {
                name: 'Unreleased supply',
                value: 50,
                color: '#4346d3',
                sortIndex: 3,
            }]
        }],
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
