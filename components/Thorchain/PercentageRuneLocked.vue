<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Percentage RUNE locked
      </h2>
    </div>
    <div class="pure-g section__body section__body--pie-chart">
      <div class="pure-u-lg-1-2 pure-u-1">
        <PercentageRuneLockedPieChart :chart-data="pieChartData" />
      </div>
      <div class="pure-u-lg-1-2 pure-u-1">
        <PercentageRuneLockedTable :data="runeLockedData" />
      </div>
    </div>
    <hr class="section__divider"></hr>

    <IncentivePendulum />
    <!--
    <div class="section__body--area-chart">
      <h3 class="section__subtitle">
        Percentage RUNE Locked Over Time
      </h3>
      <AreaChart :data="percentageRuneLockedOverTime" :format-label="e => `${e}%`" :max="100" />
    </div>
    -->
  </div>
</template>

<script>
export default {
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
    runeLockedData() {
      return [
        {
          name: 'Pools',
          percentage: this.poolPercentage,
          color: '#2D99FF',
        },
        {
          name: 'Active nodes',
          percentage: this.activeNodePercentage,
          color: '#16CEB9',
        },
        {
          name: 'Standby nodes',
          percentage: this.standbyNodePercentage,
          color: '#5E2BBC',
        },
        {
          name: 'Standby pools',
          percentage: 0,
          color: '#6648FF',
        },
        {
          name: 'Unlocked',
          percentage: this.unlockedPercentage,
          color: '#3F4357',
        },
      ];
    },
    pieChartData() {
      return this.runeLockedData.map(rld => ({
        name: rld.name,
        y: Math.round(rld.percentage * 10000) / 100,
        color: rld.color,
      }));
    },
    percentageRuneLockedOverTime() {
      return this.$store.state.timeSeries.percentageRuneLockedOverTime;
    },
  },
};
</script>

<style>
</style>
