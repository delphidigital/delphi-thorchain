<template>
  <div>
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
      [Fake chart here as we don't have historical data yet]
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts';
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
  },
};
</script>

<style>
</style>
