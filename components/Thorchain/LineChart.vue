<template>
  <div>
    <highchart 
      :options="chartOptions"
      :redraw="true"
    />
  </div>
</template>

<script>
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
    yAxisLabelOptions: {
      type: Object,
      default: {
        title: false,
        type: 'linear',
      },
    },
  },
  computed: {
    chartOptions() {
      const formatLabel = this.formatLabel;
      const areaColor = '#343d4e';
      const yAxisLabelOptions = this.yAxisLabelOptions;
      return {
        chart: {
          backgroundColor: 'transparent',
          height: 330,
          margin: [5, 0, 75, 62],
        },
        title: false,
        labels: false,
        credits: false,
        legend: false,
        tooltip: {
          formatter() {
            const date = new Date(this.point.x);
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() < 10 ? `0${date.getUTCMonth()}` : `${date.getUTCMonth()}`;
            const day = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : `${date.getUTCDate()}`;
            const hours = date.getUTCHours() < 10 ? `0${date.getUTCHours()}` : `${date.getUTCHours()}`;
            const mins = date.getUTCMinutes() < 10 ? `0${date.getUTCMinutes()}` : `${date.getUTCMinutes()}`;
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span>${year}-${month}-${day} ${hours}:${mins}</span>
                </div>
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
          }
        },
        xAxis: {
          labels: {
            useHTML: true,
            style: {
              color: '#FFFFFF',
              fontFamily: 'Montserrat',
              fontSize: 12,
              letterSpacing: 0,
              lineHeight: '16px',
              fontWeight: 500,
            },
            title: false,
            overflow: 'allow',
            margin: 0,
            padding: 0,
          },
          type: 'datetime',
          lineColor: areaColor,
          minPadding: 0,
          maxPadding: 0,
    	    gridLineWidth: 1,
          gridLineColor: areaColor,
          gridLineDashStyle: 'longdash'
        },
        yAxis: {
          ...yAxisLabelOptions,
          className: 'highcharts-yaxis--title',
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return formatLabel(this.value);
              }
              return null;
            },
            style: {
              color: '#FFFFFF',
              fontFamily: 'Montserrat',
              fontSize: 11,
              letterSpacing: 0,
              lineHeight: '20px',
              textAlign: 'right',
              fontWeight: 500,
            },
            // x: -5,
          },
          gridLineColor: areaColor,
          lineColor: areaColor,
          lineWidth: 1,
          minPadding: 0,
          maxPadding: 0,
        },
        legend:{
          enabled:true,
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
.highcharts-yaxis--title > span.highcharts-axis-title {
  font-size: 11px !important;
  left: -10px !important;
}
</style>