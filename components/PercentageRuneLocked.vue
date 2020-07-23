<template>
  <div>
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
      [Fake chart here as we don't have historical data yet]
    </div>
  </div>
</template>

<script>
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

      // using this in the view so rounding for now, also probably better to remove
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
  },
};
</script>

<style>
</style>
