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
    runeLockedData() {
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      const totalRunevault = this.$store.state.vaultBalances.runevaultBalance;
      const totalLocked =
        totalRuneDepth + totalActiveBonded + totalStandbyBonded + totalRunevault;
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const unlocked = circulatingSupply - totalLocked;

      const percentage = value => value / circulatingSupply;
      // eslint-disable-next-line no-debugger
      debugger;

      const result = [
        {
          name: 'Pools',
          percentage: percentage(totalRuneDepth),
          color: '#2D99FF',
        },
        {
          name: 'Active nodes',
          percentage: percentage(totalActiveBonded),
          color: '#16CEB9',
        },
        {
          name: 'Standby nodes',
          percentage: percentage(totalStandbyBonded),
          color: '#5E2BBC',
        },
        {
          name: 'Standby pools',
          percentage: 0,
          color: '#6648FF',
        },
      ];

      if (this.$route.params.blockchain === 'chaosnet') {
        result.push({
          name: 'RuneVault',
          percentage: percentage(totalRunevault),
          color: '#f7516f',
        });
      }

      result.push(
        {
          name: 'Unlocked',
          percentage: percentage(unlocked),
          color: '#3F4357',
        },
      );
      return result;
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
