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
  </div>
</template>

<script>
import { loadPools, loadPoolDetail, loadNodeAccounts } from '../lib/api.mjs';
import PoolDepthSummary from '../components/PoolDepthSummary.vue';
import PercentageRuneLocked from '../components/PercentageRuneLocked.vue';

export default {
  // load data here
  components: {
    PercentageRuneLocked,
    PoolDepthSummary,
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
      this.$store.commit('pools/setPoolDetail', { poolId, poolDetail });
    }));

    const nodeAccounts = await loadNodeAccounts({
      axios: this.$axios,
    });
    this.$store.commit('nodes/setNodeAccounts', nodeAccounts);
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
  padding: 16px 25px;
  border-bottom: 1px solid $color-border;
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

.pie-chart__container {
  padding-top: 30px;
}

.pie-chart__placeholder {
  height: 220px;
  width: 100%;
}

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

