<template>
  <div>
    <client-only>
      <highchart :options="chartOptions" />
    </client-only>
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

if (typeof Highcharts === 'object') {
  variablePie(Highcharts);
}

export default {
  computed: {
    data() {
      const pvds = this.$store.getters['pools/poolVolumeAndDepth'];

      return pvds.map(pvd => ({
        name: pvd.poolId,
        y: pvd.poolDepth,
        z: pvd.poolVolume,
        color: pvd.color,
      }));
    },
    chartOptions() {
      return {
        chart: {
          type: 'variablepie',
          backgroundColor: 'transparent',
          height: 200,
          margin: [0, 0, 0, 0],
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
