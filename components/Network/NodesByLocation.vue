<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Nodes distributed by location
      </h2>
    </div>
    <div class="section__body nodes-by-location">
      <client-only>
        <highmap :options="chartOptions" />
        <div slot="placeholder" class="map__placeholder" />
      </client-only>
    </div>
  </div>
</template>

<script>
import worldMap from '@highcharts/map-collection/custom/world.geo.json';

const countryColors = [
  '#2D99FF',
  '#F7C951',
  '#16CEB9',
  '#5E2BBC',
  '#F77651',
];

export default {
  computed: {
    chartData() {
      const nodesGeo = this.$store.getters['nodes/locations'];
      const countries = [];
      for (let i = 0; i < nodesGeo.length; i += 1) {
        if (!(countries.includes(nodesGeo[i]['country_code']))) {
          countries.push(nodesGeo[i]['country_code']);
        }
      }

      const cities = [];
      nodesGeo.forEach((ng) => {
        const lat = ng.latitude;
        const lon = ng.longitude;
        if (lat && lon) {
          const index = cities.findIndex(el => el.lat === lat && el.lon === lon);
          if (index !== -1) {
            cities[index].count += 1;
          } else {
            cities.push({
              lat,
              lon,
              count: 1,
              city: ng.city || '',
              country: ng['country_code'],
              countryName: ng.country,
            });
          }
        }
      });

      return {
        countries: countries.map((c, i) => (
          { country: c, color: countryColors[i % countryColors.length] }
        )),
        cities,
      };
    },
    chartOptions() {
      const citiesData = this.chartData.cities;
      const countriesData = this.chartData.countries;

      return {
        chart: {
          map: worldMap,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          lineWidth: 2,
          height: 300,
        },
        title: false,
        mapNavigation: {
          enabled: false,
        },
        path: {
          stroke: '#ff0000',
        },
        boost: {
          enabled: false,
        },
        credits: false,
        legend: false,
        tooltip: {
          formatter() {
            let country;
            let color;
            let city;
            if (this.series.name === 'countries') {
              country = this.point.code;
              color = this.point.color;
              city = null;
            } else if (this.series.name === 'cities') {
              city =
                citiesData.find(c => c.lat === this.point.lat && c.lon === this.point.lon);

              color = countriesData.find(c => c.country === city.country).color;
              country = city.country;
            } else {
              return false;
            }

            const cities =
              citiesData
                .filter(c => c.country === country);

            const countryName = cities[0].countryName;

            const cityRows =
              cities.reduce(
                (acc, ct) => {
                  if (city && (ct.city === city.city)) {
                    return `
                      ${acc}<tr style="font-weight: 600;">
                        <td>${ct.city}</td>
                        <td>${ct.count}</td>
                      </tr>
                    `;
                  }
                  return `${acc}<tr><td>${ct.city}</td><td>${ct.count}</td></tr>`;
                },
                '',
              );

            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span style="background-color: ${color};" class="app-tooltip__marker"></span><span>${countryName}</span>
                </div>
                <div class="app-tooltip__body">
                  <table class="app-tooltip__table">
                    <tbody>
                      ${cityRows}
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
        series: [
          {
            name: 'countries',
            nullColor: '#3E4B61',
            borderColor: 'transparent',
            borderWidth: 1,
            joinBy: ['iso-a2', 'code'],
            dataLabels: {
              enabled: false,
            },
            allAreas: true,
            data: this.chartData.countries.map(c => (
              { code: c.country, value: 1, color: c.color }
            )),
          },
          {
            name: 'cities',
            type: 'mappoint',
            marker: {
              fillColor: '#fff',
              lineColor: '#1F263D',
              lineWidth: 1,
              radius: 3,
            },
            states: {
              inactive: {
                opacity: 1,
              },
            },
            dataLabels: {
              enabled: false,
            },
            showInLegend: false,
            data: citiesData.map(el => ({ lat: el.lat, lon: el.lon })),
          },
        ],
      };
    },
    nodesGeo() {
      return this.$store.getters['nodes/locations'];
    },
  },
};
</script>

<style lang="scss" scoped>
.nodes-by-location {
  height: 300px;
}

.map__placeholder {
  height: 300px;
  width: 100%;
}
</style>
