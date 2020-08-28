<template>
  <div class="bar-chart-container">
    <client-only>
      <highchart v-if="chartData.length > 0" :options="chartOptions" />
      <div slot="placeholder" class="chart-placeholder" />
    </client-only>
  </div>
</template>

<script>
import numeral from 'numeral';
import { assetFromString } from '@thorchain/asgardex-util';

export default {
  computed: {
    chartData() {
      const output = [];
      this.$store.getters['vaultBalances/topList'].forEach((item) => {
        output.push({
          name: assetFromString(item.asset).ticker,
          assetsStored: item.amount,
          assetsRecorded: item.amountRecorded,
          price: item.price,
        });
      });
      return output;
    },
    chartOptions() {
      return {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          height: 200,
          margin: [0, 0, 25, 0],
        },
        title: false,
        labels: false,
        credits: false,
        legend: false,
        xAxis: {
          categories: this.chartData.map(cd => cd.name),
          labels: {
            style: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat', fontWeight: 400 },
          },
          lineColor: 'transparent',
        },
        yAxis: {
          visible: false,
        },
        plotOptions: {
          column: {
            borderWidth: 5,
            borderColor: 'transparent',
            pointPadding: 0.2,
            groupPadding: 0.3,
            borderRadius: 6,
          },
        },
        tooltip: {
          formatter() {
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span>${this.point.category}</span>
                </div>
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text" style="color: ${this.point.color};">
                    ${this.point.series.name}: ${numeral(this.point.raw).format(this.point.raw < 100 ? '0,0.00' : '0,0')}
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
        series: [
          {
            name: 'Stored',
            data: this.chartData.map(e => ({
              y: e.assetsStored * e.price,
              raw: e.assetsStored,
            })),
            color: '#16CEB9',
          },
          {
            name: 'Recorded',
            data: this.chartData.map(e => ({
              y: e.assetsRecorded * e.price,
              raw: e.assetsRecorded,
            })),
            color: '#F7517F',
          },
        ],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.bar-chart-container {
  width: 100%;
  height: 200px;
}

.chart-placeholder {
  height: 200px;
  width: 100%;
}
</style>
