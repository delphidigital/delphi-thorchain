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
      const countries = [];
      for (let i = 0; i < this.nodesGeo.length; i += 1) {
        if (!(countries.includes(this.nodesGeo[i].country))) {
          countries.push(this.nodesGeo[i].country);
        }
      }

      const cities = [];
      this.nodesGeo.forEach((ng) => {
        const [lat, lon] = ng.ll;
        const index = cities.findIndex(el => el.lat === lat && el.lon === lon);
        if (index !== -1) {
          cities[index].count += 1;
        } else {
          // TODO(Fede): Adding 'Unknown' if city name is not there but we should handle
          // this in a smarter way, probably better to do it when we define the geoip
          // method we use for good
          cities.push({
            lat,
            lon,
            count: 1,
            city: ng.city.length > 0 ? ng.city : 'Unknown',
            country: ng.country,
          });
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
        credits: false,
        legend: false,
        tooltip: {
          formatter() {
            if (this.series.name === 'countries') {
              const country = this.point.code;
              const cities =
                citiesData
                  .filter(c => c.country === country);

              const cityRows =
                cities.reduce(
                  (acc, ct) => `${acc}<tr><td>${ct.city}</td><td>${ct.count}</td></tr>`,
                  '',
                );

              return `
                <div class="app-tooltip">
                  <div class="app-tooltip__header">
                    <span style="background-color: ${this.point.color};" class="app-tooltip__marker"></span><span>${country}</span>
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
            }
            return false;
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
            enableMouseTracking: false,
            states: {
              inactive: {
                opacity: 1,
              },
            },
            dataLabels: {
              enabled: false,
            },
            showInLegend: false,
            tooltip: {
              enabled: false,
            },
            data: citiesData.map(el => ({ lat: el.lat, lon: el.lon })),
          },
        ],
      };
    },
    nodesGeo() {
      return [
        {
          range: [752877568, 754974719],
          country: 'US',
          region: 'OR',
          eu: '0',
          timezone: 'America/Los_Angeles',
          city: 'Boardman',
          ll: [45.8491, -119.7143],
          metro: 810,
          area: 1000,
        },
        {
          range: [316407808, 316473343],
          country: 'US',
          region: 'OH',
          eu: '0',
          timezone: 'America/New_York',
          city: 'Columbus',
          ll: [39.9653, -83.0235],
          metro: 535,
          area: 1000,
        },
        {
          range: [1679032320, 1679294463],
          country: 'US',
          region: 'OR',
          eu: '0',
          timezone: 'America/Los_Angeles',
          city: 'Boardman',
          ll: [45.8491, -119.7143],
          metro: 810,
          area: 1000,
        },
        {
          range: [916193280, 916455423],
          country: 'US',
          region: 'VA',
          eu: '0',
          timezone: 'America/New_York',
          city: 'Ashburn',
          ll: [39.0481, -77.4728],
          metro: 511,
          area: 1000,
        },
        {
          range: [915898368, 915931135],
          country: 'SG',
          region: '',
          eu: '0',
          timezone: 'Asia/Singapore',
          city: 'Singapore',
          ll: [1.2996, 103.8549],
          metro: 0,
          area: 50,
        },
        {
          range: [312213504, 312475647],
          country: 'US',
          region: '',
          eu: '0',
          timezone: 'America/Chicago',
          city: '',
          ll: [37.751, -97.822],
          metro: 0,
          area: 1000,
        },
        {
          range: [50888704, 50921471],
          country: 'GB',
          region: 'ENG',
          eu: '1',
          timezone: 'Europe/London',
          city: 'London',
          ll: [51.5164, -0.093],
          metro: 0,
          area: 200,
        },
        {
          range: [312213504, 312475647],
          country: 'US',
          region: '',
          eu: '0',
          timezone: 'America/Chicago',
          city: '',
          ll: [37.751, -97.822],
          metro: 0,
          area: 1000,
        },
        {
          range: [918028288, 918552575],
          country: 'US',
          region: 'OR',
          eu: '0',
          timezone: 'America/Los_Angeles',
          city: 'Boardman',
          ll: [45.8491, -119.7143],
          metro: 810,
          area: 1000,
        },
      ];
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
