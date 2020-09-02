<template>
  <div class="pie-chart__container">
    <AppHighchart
      :chart-options="chartOptions"
      :placeholder-height="220"
    />
  </div>
</template>

<script>
import AppHighchart from '../Common/AppHighchart.vue';

export default {
  components: {
    AppHighchart,
  },
  props: {
    chartData: {
      // NOTE(Fede) [{name: string, y: number, color: string}, ...]
      type: Array,
      default: () => [],
    },
  },
  computed: {
    chartOptions() {
      const unlocked = this.chartData.find(cd => cd.name === 'Unlocked');
      const unlockedPercentage = unlocked ? unlocked.y : 0;
      const lockedPercentage = Math.round(100 - unlockedPercentage);
      return {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          height: 220,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: `
            <span style="font-family: Montserrat; font-size: 24px; font-weight: 600; line-height: 32px;">
              ${lockedPercentage}%
            </span>
            `,
          style: { color: '#fff' },
          useHtml: true,
          verticalAlign: 'middle',
          floating: true,
        },
        subtitle: {
          text: `
            <span style="font-family: Montserrat; font-size: 12px; font-weight: 300; opacity: 80%;">of total supply locked</span>
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
                    ${this.point.y}%
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
