<template>
  <div>
    <highchart 
      :options="chartOptions"
      :redraw="true"
    />
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  props: {
    // NOTE(Fede): data prop should be a list of objects {date: Date, value: number}
    data: {
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
    xAxisCategories: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    chartOptions() {
      const formatLabel = this.formatLabel;
      const areaColor = '#323f64';
      const xAxisCategories = this.xAxisCategories;
      return {
        chart: {
          backgroundColor: 'transparent',
          height: 330,
          margin: [5, 0, 75, 32],
          type: 'column'
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
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text">
                    ${formatLabel(this.point.y)}
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
        plotOptions: {
          series: {
            marker: {
              enabled: false
            }
          },
          column: {
            borderWidth: 0,
          },
        },
        xAxis: {
          categories: xAxisCategories,
          labels: {
            useHTML: true,
            style: { color: '#fff', fontSize: 10 },
            title: false,
            overflow: 'allow',
            margin: 0,
            padding: 0,
          },
          lineColor: areaColor,
        },
        yAxis: {
          min: 0,
          className: 'highcharts-yaxis--title',
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return formatLabel(this.value);
              }
              return null;
            },
            style: { color: '#fff', fontSize: 7 },
            x: -5,
          },
          gridLineColor: areaColor,
          lineColor: areaColor,
          lineWidth: 1,
          minPadding: 0,
          maxPadding: 0,
        },

        legend:{
          enabled:false,
          align: 'center',
          verticalAlign: 'bottom',
          x: 0,
          y: 10,
          itemStyle: {
            color: '#ffffff',
          }
        },
        series: this.data,
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