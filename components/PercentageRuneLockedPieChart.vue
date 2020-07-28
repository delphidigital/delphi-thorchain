<template>
  <div class="pie-chart__container">
    <client-only>
      <highchart :options="chartOptions" />
      <div slot="placeholder" class="pie-chart__placeholder" />
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    chartData: {
      // NOTE(Fede) [{name: string, y: number, color: string}, ...]
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
          height: 220,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: `
            <span style="font-family: Montserrat; font-size: 24px; font-weight: 600; line-height: 32px;">
              ${this.lockedDisplayPercentage}%
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
    lockedDisplayPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalLocked = totalRuneDepth + totalActiveBonded + totalStandbyBonded;

      // NOTE(Fede): using this in the view so rounding for now, also probably better to remove
      // duplication later.
      return Math.round((totalLocked / circulatingSupply) * 100);
    },
  },
};
</script>
