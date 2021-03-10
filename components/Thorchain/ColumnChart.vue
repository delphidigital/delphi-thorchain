<template>
  <div>
    <highchart
      :ref="refName"
      :options="chartOptions"
      :redraw="true"
      :reflow="true"
    />
  </div>
</template>

<script>
import { format } from 'date-fns';
import Highcharts from 'highcharts';
import highchartsBorderRadius from '../../plugins/highchartsBorderRadius';

if (typeof Highcharts === 'object') {
  highchartsBorderRadius(Highcharts);
}

export default {
  props: {
    refName: {
      type: String,
      default: () => undefined,
    },
    // NOTE(Fede): data prop should be a list of objects {date: Date, value: number}
    chartData: {
      type: Array,
      default: () => [],
    },
    categories: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: null,
    },
    formatLabel: {
      type: Function,
      default: v => v,
    },
    xAxisOptions: {
      type: Object,
      default: () => ({}),
    },
    xAxisCategories: {
      type: Array,
      default: () => [],
    },
    customPlotOptions: {
      type: Object,
      default: () => ({}),
    },
    legendOptions: {
      type: Object,
      default: () => ({}),
    },
    customChartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    // NOTE: Hack to fix a possible bug with highcharts, where for some column stacked bars
    //       are not shown properly. This hack forces a full reflow redraw by hiding and showing a value.
    // reference: https://github.com/highcharts/highcharts/issues/7516
    //            https://www.highcharts.com/forum/viewtopic.php?t=39153
    chartData: {
      immediate: true, 
      handler (val, _oldVal) {
        if (
          typeof this.refName === 'string'
          && this.$refs[this.refName]?.chart
          && this.$refs[this.refName]?.chart.series
          && this.$refs[this.refName]?.chart.series.length
        ) {
          this.$refs[this.refName].chart.series[this.$refs[this.refName].chart.series.length-1].hide();
          setTimeout(() => {
            if (this.$refs[this.refName]?.chart) {
              this.$refs[this.refName].chart.series[this.$refs[this.refName].chart.series.length-1].show();
              this.$refs[this.refName].chart.reflow();
              this.$refs[this.refName].chart.redraw();
            }
          }, 500); // wait for 400ms animation to end
        }
      }
    },
  },
  computed: {
    chartOptions() {
      const areaColor = '#343d4e';
      const { formatLabel } = this;
      return {
        chart: {
          backgroundColor: 'transparent',
          height: 330,
          margin: [5, 0, 75, 32],
          type: 'column',
          ...this.customChartOptions,
        },
        title: false,
        labels: false,
        credits: false,
        legend: false,
        marker: {
          enabled: false,
        },
        tooltip: {
          formatter() {
            let tooltipName = '';
            if (this.point.name && typeof this.point.name === 'string') {
              tooltipName = `
                <p class="app-tooltip__text" style="font-weight: bold; font-size: 12px;">
                    ${this.point.name}
                </p>
              `;
            }
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text" style="font-weight: bold; font-size: 12px;">
                    ${formatLabel(this.point.y)}
                  </p>
                  ${tooltipName}
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
          ...this.customTooltipOptions,
        },
        plotOptions: {
          series: {
            marker: {
              enabled: false,
            }
          },
          column: {
            borderWidth: 0,
            borderRadiusStart: 0,
            borderRadiusEnd: 11,
            pointWidth: 28,
          },
          ...this.customPlotOptions,
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
            formatter() {
              return formatLabel(this.value);
            },
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
        legend:{
          enabled:false,
          align: 'center',
          verticalAlign: 'bottom',
          x: 0,
          y: 10,
          itemStyle: {
            color: '#ffffff',
          },
          ...this.legendOptions
        },
        series: this.chartData,
      };
    },
  },
};
</script>

<style lang="scss">
.highcharts-xaxis--title > span.highcharts-axis-title {
  font-size: 11px !important;
  left: -10px !important;
}
</style>