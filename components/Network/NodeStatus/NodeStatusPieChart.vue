<template>
  <div>
    <div ref="chart" class="chart-placeholder" />
  </div>
</template>

<script>
import Highcharts from 'highcharts';

export default {
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    chartOptions() {
      return {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          height: 250,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: `
            <span style="font-family: Montserrat; font-size: 24px; font-weight: 600; line-height: 32px;">
              ${this.chartData.reduce((a, c) => c.y + a, 0)}
            </span>
            `,
          style: { color: '#fff' },
          useHtml: true,
          verticalAlign: 'middle',
          floating: true,
        },
        subtitle: {
          text: `
            <span style="font-family: Montserrat; font-size: 12px; font-weight: 300; opacity: 80%;">Total nodes</span>
            `,
          style: { color: '#fff' },
          useHtml: true,
          verticalAlign: 'middle',
          floating: true,
          y: 25,
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
                    ${this.point.y}
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
          pie: {
            dataLabels: {
              enabled: false,
            },
            borderColor: null,
          },
        },
        series: [{
          innerSize: '92%',
          data: this.chartData,
        }],
      };
    },
  },
  watch: {
    chartOptions(newData) {
      // NOTE(Fede): It seems that on some conditions Highcharts fails so init some internal
      // stuff properly and fails if called at the wrong time. Just retrying the update
      // seems to work just fine. Not worth it to dig deeper into the issue for now.
      try {
        this.chart.update(newData);
      } catch (e) {
        this.chart.update(newData);
      }
    },
  },
  mounted() {
    if (typeof window === 'object') {
      this.chart = Highcharts.chart(this.$refs.chart, this.chartOptions);
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>

<style>
.chart-placeholder {
  height: 250px;
}
</style>
