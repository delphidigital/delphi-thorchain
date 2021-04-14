<template>
  <div class="section section--flex">
    <div class="section__header" id="percentage-rune-locked">
      <h2 class="section__title">
        Percentage of RUNE locked
      </h2>
      <a class="deeplink-selector" href="#percentage-rune-locked">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
      <a class="tweet__link" :href="tweetPercentageRUNElocked" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
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
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const percentageRuneLockedDeepLink = `${baseUrl}${tabBasePath}#percentage-rune-locked`;
    return {
      tweetPercentageRUNElocked: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Percentage RUNE locked')}&url=${encodeURIComponent(percentageRuneLockedDeepLink)}`,
    }
  },
  computed: {
    runeLockedData() {
      const v1Net = this.$store.state.networkHealth.v1SinglechainNetwork;
      const v1Stats = this.$store.state.networkHealth.v1SinglechainStats;

      const v1Bm = v1Net?.bondMetrics;
      const v1TotalActiveBonded = v1Bm?.totalActiveBond && v1Bm.totalActiveBond !== "0"
          ? parseInt(v1Bm.totalActiveBond, 10) / (10 ** 8)
          : 0;
      const v1SupSandbyBonded = v1Bm?.totalStandbyBond && v1Bm.totalStandbyBond !== "0"
        ? parseInt(v1Bm.totalStandbyBond, 10) / (10 ** 8)
        : 0;

      const v1SupReserve = v1Net?.totalReserve && v1Net.totalReserve !== "0"
          ? parseInt(v1Net.totalReserve, 10) / 10 ** 8
          : 0;
      // http://157.90.98.196:8080/v1/doc#operation/GetStats
      const v1RuneDepth = parseInt(v1Stats.totalDepth, 10) / (10 ** 8);

      const v1TotalLocked = v1RuneDepth + v1TotalActiveBonded + v1SupSandbyBonded + v1SupReserve;
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];

      const totalRunevault = this.$store.state.vaultBalances.runevaultBalance;
      const totalLocked =
        totalRuneDepth + totalActiveBonded + totalStandbyBonded + totalRunevault + v1TotalLocked;
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const unlocked = circulatingSupply - totalLocked;

      const stagedPools = this.$store.state.pools.poolsOverview.filter(p => p.status === 'staged');
      const totalStagedPools = stagedPools.reduce((acc, next) => (acc + (parseInt(next.runeDepth, 10) / (10 ** 8))), 0);

      const percentage = value => value / circulatingSupply;

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
          percentage: percentage(totalStagedPools),
          color: '#6648FF',
        },
        {
          name: 'Single chain',
          percentage: percentage(v1TotalLocked),
          color: '#fD99FF',
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
.section--flex {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.section__body--pie-chart {
  flex: 1;
  align-content: center;
}
</style>
