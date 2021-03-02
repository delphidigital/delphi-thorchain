<template>
  <AppHighchart :chart-options="chartOptions" :placeholder-height="350" />
</template>

<script>
import AppHighchart from '../Common/AppHighchart.vue';

export default {
  components: {
    AppHighchart,
  },
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
          height: 350,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: `
            <div style="text-align: center;">
                <div style="margin-bottom: 12px; font-family: Montserrat; font-size: 24px; font-weight: 500; line-height: 32px;font-weight: 700;">
                    $0.50
                </div>
                <div style="font-size: 13px; opacity: 0.75;font-weight: 600;margin-bottom: 20px;">
                    Deterministic Price
                </div>
                <hr style="opacity: 0.3"/>
                <div style="margin-bottom: 12px; font-family: Montserrat; font-size: 24px; font-weight: 500; line-height: 32px;font-weight: 700;margin-top: 20px;">
                    x9.25
                </div>
                <div style="font-size: 13px; opacity: 0.75;font-weight: 500;">
                    Speculative Multiplier
                </div>
            </div>
            `,
          style: { color: '#fff' },
          useHTML: true,
          verticalAlign: 'middle',
          floating: true,
        },
        // subtitle: {
        //   text: `
        //     <span style="font-family: Montserrat; font-size: 12px; font-weight: 300; opacity: 80%;">Total nodes</span>
        //     `,
        //   style: { color: '#fff' },
        //   useHtml: true,
        //   verticalAlign: 'middle',
        //   floating: true,
        //   y: 25,
        // },
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
};
</script>

<style>
.chart-placeholder {
  height: 350px;
}
</style>
