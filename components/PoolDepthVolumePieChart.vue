<template>
  <div>
    <div class="pie-chart__container">
      <client-only>
        <highchart :options="chartOptions" />
        <div slot="placeholder" class="pie-chart__placeholder" />
      </client-only>
    </div>
    <dl class="legend">
      <dt class="legend__tag">
        Angle:
      </dt>
      <dd class="legend__desc">
        depth
      </dd>
      <dt class="legend__tag">
        Radius:
      </dt>
      <dd class="legend__desc">
        volume
      </dd>
    </dl>
  </div>
</template>

<script>
import Highcharts from 'highcharts';
import variablePie from 'highcharts/modules/variable-pie';
import numeral from 'numeral';

if (typeof Highcharts === 'object') {
  variablePie(Highcharts);
}

export default {
  computed: {
    data() {
      const pvds = this.$store.getters['pools/poolVolumeAndDepth'];
      const priceUSD = this.$store.state.runeMarketData.priceUSD;

      // TODO(Fede): This is in rune for now, but maybe it should be in another unit?
      // The table means to show everything in USD I think. Show the correct units
      // when it becomes clear what to do where.
      return pvds.map(pvd => ({
        name: pvd.poolId,
        y: pvd.poolDepth * priceUSD,
        z: pvd.poolVolume * priceUSD,
        color: pvd.color,
      }));
    },
    chartOptions() {
      const formatCurrency = number => numeral(number).format('($0,00a)').toUpperCase();
      return {
        chart: {
          type: 'variablepie',
          backgroundColor: 'transparent',
          height: 220,
          margin: [0, 0, 0, 0],
        },
        tooltip: {
          formatter() {
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span style="background-color: ${this.point.color}" class="app-tooltip__marker"></span><span>${this.point.name}</span>
                </div>
                <div class="app-tooltip__body">
                  <table class="app-tooltip__table">
                    <tbody>
                      <tr>
                        <td>Volume</td>
                        <td class="app-tooltip__table__data--highlight">${formatCurrency(this.point.z)}</td>
                      </tr>
                      <tr>
                        <td>Depth</td>
                        <td class="app-tooltip__table__data--highlight">${formatCurrency(this.point.y)}</td>
                      </tr>
                    </tbody>
                  </table>
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
        title: false,
        labels: false,
        credits: false,
        plotOptions: {
          variablepie: {
            dataLabels: {
              enabled: false,
            },
            borderColor: null,
          },
        },
        series: [{
          data: this.data,
        }],
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.legend {
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  font-weight: 300;
  font-size: 11px;
  opacity: 60%;
}
.legend__tag {
  float: left;
  display: block;
  padding: 0;
  margin: 0;
  width: 50%;
  text-align: right;
}

.legend__desc {
  float: left;
  display: block;
  text-align: left;
  width: 50%;
  padding: 0;
  margin: 0;
  padding-left: 5px;
}
</style>
