<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Nodes distributed by location
      </h2>
    </div>
    <div class="section__body">
      <highmap :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import worldMap from '@highcharts/map-collection/custom/world.geo.json';

export default {
  computed: {
    chartOptions() {
      return {
        chart: {
          map: worldMap,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        title: false,
        mapNavigation: {
          enabled: false,
        },
        path: {
          stroke: '#ff0000',
        },
        credits: false,
        legend: false,
        series: [{
          name: 'Random data',
          nullColor: '#3E4B61',
          borderColor: 'transparent',
          borderWidth: 1,
          joinBy: ['iso-a2', 'code'],
          dataLabels: {
            enabled: false,
          },
          allAreas: true,
          data: [
            {
              code: 'US',
              value: 12,
              color: '#2D99FF',
            },
            {
              code: 'BR',
              value: 13,
              color: '#F7C951',
            },
            {
              code: 'AU',
              value: 18,
              color: '#16CEB9',
            },
            {
              code: 'DE',
              value: 7,
              color: '#5E2BBC',
            },
            {
              code: 'CN',
              value: 8,
              color: '#F77651',
            },
          ],
        }],
      };
    },
  },
};
</script>
