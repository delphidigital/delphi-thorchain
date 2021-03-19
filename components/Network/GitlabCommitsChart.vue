<template>
  <div>
    <AppHighchart :chart-options="chartOptions" :placeholder-height="320" />
  </div>
</template>

<script>
import numeral from 'numeral';
import AppHighchart from '../Common/AppHighchart.vue';
export default {
  components: {
    AppHighchart,
  },
//   props: {
//     chartData: {
//       type: Array,
//       default: () => [],
//     },
//     deterministicRunePrice: {
//       type: Number,
//       default: () => 0,
//     },
//     speculativeMultiplier: {
//       type: Number,
//       default: () => 0,
//     },
//   },
  computed: {
    chartOptions() {
        const areaColor = '#343d4e';
    //   const deterministicRunePrice = numeral(this.deterministicRunePrice).format('($0,0.00)')
    //   const speculativeMultiplier = this.speculativeMultiplier.toFixed(2);
      return {
        chart: {
          type: 'area',
          backgroundColor: 'transparent',
        //   height: 320,
          margin: [0, 0, 0, 0],
        },
        title: {
            text: '',
        },
        xAxis: {
          categories: this.xAxisCategories,
          labels: {
            useHTML: true,
            style: { color: '#fff', fontSize: 10 },
            title: false,
            overflow: 'allow',
            margin: 0,
            padding: 0,
          },
          lineColor: areaColor,
    	    gridLineWidth: 1,
          gridLineColor: areaColor,
          gridLineDashStyle: 'longdash',
          ...this.xAxisOptions,
        },
        yAxis: {
          // min: 0,
          className: 'highcharts-yaxis--title',
          labels: {
            style: { color: '#fff', fontSize: "7px" },
            x: -5,
          },
          gridLineColor: areaColor,
          lineColor: areaColor,
          lineWidth: 1,
          minPadding: 0,
          maxPadding: 0,
          plotLines: [{
            color: '#c4c4c4',
            width: 1,
            value: 0,
            zIndex:2
          }]
        },
        legend: {
            enabled: false,
        },
        tooltip: {
          formatter() {
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span style="background-color: ${this.point.color}" class="app-tooltip__marker"></span><span>${this.point.name}</span>
                </div>
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text">
                    ${numeral(this.point.y).format('($0,0.00)')}
                  </p>
                </div>
              </div>
            `;
          },
          useHTML: true,
          borderWidth: 0,
          borderRadius: 0,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          shadow: false,
          padding: 0,
        },
        labels: false,
        credits: false,
        plotOptions: {
            area: {
                lineColor: "#16cdb9",
                fillColor: "#1d374866",
                marker: {
                   enabled: false
                }
            }
        },
        series: [{
            name: 'USA',
            data: [23586, 22380,
            21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950, 10871, 10824,
            10577, 10527, 10475, 10421, 10358, 10295, 10104, 9914, 9620, 9326,
            5113, 5113, 4954, 4804, 4761, 4717, 4368, 4018
            ]
        }]
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
