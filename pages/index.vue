<template>
  <div class="container">
    <div class="dashboard__header">
      <h1 class="title">
        Dashboard
      </h1>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-2" style="padding-right: 15px;">
        <PoolDepthSummary />
      </div>
      <div class="pure-u-1 pure-u-md-1-2" style="padding-left: 15px;">
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
.title {
  display: block;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 10px;
}
</style>

<style lang="scss">
@import '../assets/css/global.scss';
/*
* NOTE(Fede): Global styles go here
*/

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
* HEADER
*/

.header {
  width: 100%;
  background-color: $color-bg;
  padding: 10px;
}

.header__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.header__logo {
  height: 50px;
}

/*
* MAIN
*/

.container {
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 10px;
}


/*
 * SECTION
 */

.section {
  background-color: $color-bg;
  padding: 20px;
  border-radius: 10px;
}

.section__title {
  margin-bottom: 10px;
}

.section__subtitle {
  margin-bottom: 10px;
}
</style>

