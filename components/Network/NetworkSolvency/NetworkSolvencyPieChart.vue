<template>
  <div style="height: 70px;">
    <client-only>
      <highchart :options="chartOptions" />
      <div slot="placeholder" class="pie-chart__placeholder" />
    </client-only>
  </div>
</template>

<script>
export default {
  props: {
    solvency: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    styling() {
      return 'font-family: Montserrat; font-size: 12px; font-weight: 600;';
    },
    chartOptions() {
      return {
        chart: {
          type: 'pie',
          height: 70,
          width: 70,
          backgroundColor: 'transparent',
          margin: [0, 0, 0, 0],
          spacingTop: 0,
          spacingBottom: 0,
          spacingLeft: 0,
          spacingRight: 0,
        },
        title: {
          text: `
            <span style="${this.styling}">
              ${this.solvency * 100}<span style="${this.styling}">%</span>
            </span>
            `,
          style: { color: '#fff' },
          useHtml: true,
          verticalAlign: 'middle',
          floating: true,
        },
        tooltip: {
          enabled: false,
        },
        labels: false,
        credits: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false,
            },
            size: '100%',
            borderColor: null,
          },
        },
        series: [{
          innerSize: '88%',
          size: '100%',
          slicedOffset: 2,
          states: {
            hover: {
              enabled: false,
            },
            inactive: {
              opacity: 1,
            },
          },
          data: [
            {
              name: 'Solvency',
              y: this.solvency * 100,
              color: '#16CEB9',
            },
            {
              name: 'Insolvency',
              y: (1 - this.solvency) * 100,
              color: '#F7517F',
            },
          ],
        }],
      };
    },
  },
};
</script>
