<template>
  <div>
    <div class="pie-chart__container">
      <AppHighchart
        :chart-options="chartOptions"
        :placeholder-height="220"
      />
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
import AppHighchart from '../Common/AppHighchart.vue';

if (typeof Highcharts === 'object') {
  variablePie(Highcharts);
}

export default {
  components: {
    AppHighchart,
  },
  props: {
    top5PoolsWithOthers: {
      type: Array,
      default: [],
    },
    currentTimeOption: {
      type: String,
      default: '1M',
    },
  },
  computed: {
    data() {
      return this.top5PoolsWithOthers.map(p => ({
        name: p.poolId,
        y: p.totalDepthUsd,
        z: p.totalVolumeUsd,
        color: p.color,
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
