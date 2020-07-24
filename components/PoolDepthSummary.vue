<template>
  <div class="section">
    <h2>Pool depth & volume</h2>
    <div class="pure-g">
      <div class="pure-u-2-5">
        <client-only>
          <highchart :options="pieChartOptions" />
        </client-only>
      </div>
      <div class="pure-u-3-5">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Name</th>
              <th>Volume</th>
              <th>Depth</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in poolVolumeAndDepth" :key="item.poolId">
              <td>{{ item.poolId }}</td>
              <td>
                <RuneUSD :rune="item.poolVolume" />
              </td>
              <td>
                <RuneUSD :rune="item.poolDepth" />
              </td>
            </tr>
            <tr style="border-top: 1px solid #fff;">
              <td colspan="2">
                Total value locked in pools:
              </td>
              <td>
                <RuneUSD :rune="totalPoolDepth" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h3 class="section__subtitle">
        Liquidity depth over time
      </h3>
      <client-only>
        <highchart :options="areaChartOptions" />
      </client-only>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts';
import { format } from 'date-fns';
import variablePie from 'highcharts/modules/variable-pie';
import RuneUSD from './RuneUSD.vue';

// NOTE(Fede): Prevent this from failing when run on server side as it calls 'window'
if (typeof Highcharts === 'object') {
  variablePie(Highcharts);
}

export default {
  components: {
    RuneUSD,
  },
  computed: {
    poolVolumeAndDepth() {
      return this.$store.getters['pools/poolVolumeAndDepth'];
    },
    totalPoolDepth() {
      return this.$store.getters['pools/totalPoolDepth'];
    },
    liquidityDepthOverTime() {
      return this.$store.state.timeSeries.liquidityDepthOverTime;
    },
    pieChartOptions() {
      const chartData =
        this.poolVolumeAndDepth
          .map(pvd => ({
            name: pvd.poolId,
            y: pvd.poolDepth,
            z: pvd.poolVolume,
          }));

      return {
        chart: {
          type: 'variablepie',
          backgroundColor: 'transparent',
        },
        title: false,
        labels: false,
        credits: false,
        plotOptions: {
          variablepie: {
            dataLabels: {
              enabled: false,
            },
          },
        },
        series: [{
          data: chartData,
        }],
      };
    },
    areaChartOptions() {
      return {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          height: 200,
        },
        title: false,
        labels: false,
        credits: false,
        legend: false,
        plotOptions: {
          areaspline: {
            dataLabels: {
              enabled: false,
            },
            fillColor: '#262f51',
          },
        },
        xAxis: {
          categories: this.liquidityDepthOverTime.map(e => format(e.date, 'dd MMM yyyy')),
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return this.value;
              }
              return null;
            },
            overflow: 'allow',
            style: { color: '#fff' },
          },
        },
        yAxis: {
          title: false,
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return `$${this.value}`;
              }
              return null;
            },
            style: { color: '#fff' },
          },
        },
        series: [{
          marker: {
            enabled: false,
          },
          color: '#262f51',
          data: this.liquidityDepthOverTime.map(e => e.value),
        }],
      };
    },
  },
};
</script>

<style>
</style>
