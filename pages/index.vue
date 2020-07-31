<template>
  <div class="container">
    <div class="dashboard__header">
      <h1 class="title">
        Dashboard
      </h1>
      <NetworkToggle />
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-2 section--split-left">
        <PoolDepthSummary />
      </div>
      <div class="pure-u-1 pure-u-md-1-2 section--split-right">
        <PercentageRuneLocked />
      </div>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-2-3 section--split-left">
        <PoolList />
      </div>
      <div class="pure-u-1 pure-u-md-1-3 section--split-right">
        <StandbyPools />
      </div>
    </div>

    <NodeSummary />
  </div>
</template>

<script>
import {
  loadPools,
  loadPoolDetail,
  loadMarketData,
  loadConstants,
  loadNodeAccounts,
  loadNetwork,
  loadLastBlock,
} from '../lib/api.mjs';
import PoolDepthSummary from '../components/PoolDepthSummary.vue';
import PercentageRuneLocked from '../components/PercentageRuneLocked.vue';
import NodeSummary from '../components/NodeSummary.vue';

export default {
  // load data here
  components: {
    PercentageRuneLocked,
    PoolDepthSummary,
    NodeSummary,
  },
  async fetch() {
    const poolIds = await loadPools({
      axios: this.$axios,
    });
    this.$store.commit('pools/setPoolIds', poolIds);

    await Promise.all(poolIds.map(async (poolId) => {
      const poolDetail = await loadPoolDetail({
        axios: this.$axios,
        poolId,
      });
      this.$store.commit('pools/setPoolDetail', { poolId, poolDetail: poolDetail[0] });
    }));

    const nodeAccounts = await loadNodeAccounts({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNodeAccounts', nodeAccounts);

    const lastBlock = await loadLastBlock({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setLastBlock', lastBlock.thorchain);

    const network = await loadNetwork({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNextChurnHeight', network.nextChurnHeight);

    const marketData = await loadMarketData({
      axios: this.$axios,
    });
    this.$store.commit('runeMarketData/setData', marketData);

    const constants = await loadConstants({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setOldValidatorRate', constants['int_64_values'].OldValidatorRate);
    this.$store.commit('nodes/setRotatePerBlockHeight', constants['int_64_values'].RotatePerBlockHeight);
  },
  mounted() {
    this.pollData();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  methods: {
    pollData() {
      this.polling = setInterval(() => {
        this.$fetch();
      }, process.env.pollingFrequency);
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 10px;
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media screen and (max-width: 21.5em) {
    flex-direction: column;
    justify-content: center;
    margin-bottom: 35px;
  }
}

.title {
  display: block;
  font-weight: 700;
  font-size: 22px;
  margin: 30px 0;
}
</style>

<style lang="scss">
/*
* NOTE(Fede): Global styles go here
*/
// FONTS
//@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');


// PURE CSS overrides
// https://purecss.io/grids/#using-grids-with-your-font-family
html, button, input, select, textarea,
.pure-g [class *= "pure-u"] {
  /* Set your content font stack here: */
  font-family: Montserrat, sans-serif;
}

/* ELEMENT OVERRIDES */

html {
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #fff;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

body {
  background-color: $color-bg-shade;
}

h1 {
  margin: 0;
}

ul {
  display: block;
  list-style-type: none;
}

li {
  display: block;
  margin: 0;
  padding: 0;
}

button {
  outline: none;
  cursor: pointer;

  &:hover, &:focus {
    outline: none;
  }
}

/*
 * SECTION
 */

.section {
  background-color: $color-bg;
  border-radius: 10px;
  margin-bottom: 30px;

  @media screen and (max-width: $pureg-md) {
    margin-bottom: 15px;
  }
}

.section--split-left {
  padding-right: 15px;

  @media screen and (max-width: $pureg-md) {
    padding-right: 0px;
  }
}

.section--split-right {
  padding-left: 15px;
  @media screen and (max-width: $pureg-md) {
    padding-left: 0px;
  }
}

.section__header {
  padding: 0px 25px;
  border-bottom: 1px solid $color-border;
  height: 58px;
  display: flex;
  align-items: center;
}

.section__title {
  font-size: 17px;
  font-weight: 600;
}


.section__body--pie-chart {
  height: 300px;
  display: flex;
  padding-right: 25px;

  @media screen and (max-width: $pureg-lg) {
    height: 580px;
    padding-left: 25px;
  }
}

.section__body--area-chart {
  padding: 20px 25px;
}

.section__subtitle {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
}

.section__divider {
  border: 0;
  border-top: 1px solid $color-border;
  height: 1px;
  display: block;
}

/*
* SECTION TABLE
*/

.section__table {
  border-collapse: collapse;
  padding-bottom: 5px;
}

.section__table__head {
  font-size: 11px;
  line-height: 15px;
  text-transform: uppercase;
  font-weight: 500;
  color: $color-text-secondary;
  text-align: left;
  padding: 8px 0;
  background-color: $color-bg-table-header;
}

.section__table__head--right {
  text-align: right
}

.section__table__row {
  border-top: 1px solid $color-border;
}

$padding-section-table: 25px;

.section__table__head:first-child {
  padding-left: $padding-section-table;
}

.section__table__head:last-child {
  padding-right: $padding-section-table;
}

.section__table__data {
  font-size: 14px;
  font-weight: 500;
  padding-top: 15px;
  padding-bottom: 15px;
}

.section__table__data:first-child {
  padding-left: $padding-section-table;
}

.section__table__data:last-child {
  padding-right: $padding-section-table;
}

.section__table__data--highlight {
  font-weight: 700;
}

.section__table__data--right {
  text-align: right;
}

/*
 * CHARTS
 */

.pie-chart__container {
  padding-top: 30px;
}

.pie-chart__placeholder {
  height: 220px;
  width: 100%;
}

.area-chart__placeholder {
  height: 130px;
  width: 100%;
}

/*
 * TOOLTIP FOR CHARTS
 */

.app-tooltip {
  background-color: $color-bg-popup;
  color: #fff;
  border: none;
  margin: 0;
  padding: 0;
  font-family: Montserrat;
  font-size: 12px;
  border-radius: 4px;
  width: 170px;
  box-shadow: 10px 10px 30px 0px rgba(0,0,0,0.4);
}

.app-tooltip__header {
  font-weight: 400;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px 0px;
  text-align: center;
}

.app-tooltip__body {
  padding: 10px 15px;
}

.app-tooltip__marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

.app-tooltip__table {
  width: 100%;
  boarder-collapse: collapse;
  td {
    padding-bottom: 6px;
  }
}

.app-tooltip__text {
  text-align: center;
  margin: 0;
  padding: 0;
}

.app-tooltip__table__data--highlight {
  font-weight: 600;
  text-align: right;
}
</style>

