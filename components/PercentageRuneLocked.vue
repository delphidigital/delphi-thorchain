<template>
  <div class="section">
    <h2>Percentage RUNE locked</h2>
    <div class="pure-g">
      <div class="pure-u-2-5">
        <client-only>
          <highchart :options="pieChartOptions" />
        </client-only>
      </div>
      <div class="pure-u-3-5">
        <table>
          <tbody>
            <tr v-for="item in runeLockedData" :key="item.name">
              <td>{{ item.name }}</td>
              <td>
                <Percentage :value="item.percentage" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h3 class="section__subtitle">
        Percentage RUNE Locked Over Time
      </h3>
      <client-only>
        <highchart :options="areaChartOptions" />
      </client-only>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';
import Percentage from './Percentage.vue';

export default {
  components: {
    Percentage,
  },
  computed: {
    poolPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      return totalRuneDepth / circulatingSupply;
    },
    activeNodePercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      return totalActiveBonded / circulatingSupply;
    },
    standbyNodePercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      return totalStandbyBonded / circulatingSupply;
    },
    unlockedPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalLocked = totalRuneDepth + totalActiveBonded + totalStandbyBonded;
      const totalUnlocked = circulatingSupply - totalLocked;
      return totalUnlocked / circulatingSupply;
    },
    lockedDisplayPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalLocked = totalRuneDepth + totalActiveBonded + totalStandbyBonded;

      // NOTE(Fede): using this in the view so rounding for now, also probably better to remove
      // duplication later.
      return Math.round((totalLocked / circulatingSupply) * 100);
    },
    runeLockedData() {
      return [
        {
          name: 'Pools',
          percentage: this.poolPercentage,
        },
        {
          name: 'Active nodes',
          percentage: this.activeNodePercentage,
        },
        {
          name: 'Standby nodes',
          percentage: this.standbyNodePercentage,
        },
        {
          name: 'Stanby pools',
          percentage: 0,
        },
        {
          name: 'Unlocked',
          percentage: this.unlockedPercentage,
        },
      ];
    },
    percentageRuneLockedOverTime() {
      return this.$store.state.timeSeries.percentageRuneLockedOverTime;
    },
    pieChartOptions() {
      return {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
        },
        title: {
          text: `
            <span style="font-weight: bold; font-size: 32px;">${this.lockedDisplayPercentage}%</span><br /><br />
            <span style="font-size: 12px;">of total supply locked</span>
          `,
          style: { color: '#fff' },
          useHtml: true,
          verticalAlign: 'middle',
          floating: true,
        },
        labels: false,
        credits: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false,
            },
          },
        },
        series: [{
          innerSize: '92%',
          data: this.runeLockedData.map(rld => ({ name: rld.name, y: rld.percentage })),
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
          categories: this.percentageRuneLockedOverTime.map(e => format(e.date, 'dd MMM yyyy')),
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
          max: 100,
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return `%${this.value}`;
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
          data: this.percentageRuneLockedOverTime.map(e => e.value),
        }],
      };
    },
  },
};
</script>

<style>
</style>
