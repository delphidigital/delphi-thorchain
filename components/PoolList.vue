<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Pool list
      </h2>
    </div>
    <div class="section__body">
      <table class="section__table pool-list-table">
        <thead>
          <tr>
            <th class="section__table__head">
              Name
            </th>
            <th class="section__table__head">
              1% Slippage Depth
            </th>
            <th class="section__table__head">
              Mean Fee
            </th>
            <th class="section__table__head">
              Median Fee
            </th>
            <th class="section__table__head">
              Volume
            </th>
            <th class="section__table__head">
              APY
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pool in pools" :key="pool.name" class="section__table__row">
            <td class="section__table__data section__table__data--highlight">
              {{ pool.name }}
            </td>
            <td class="section__table__data">
              <RuneUSD :rune="pool.slipageDepth" />
            </td>
            <td class="section__table__data">
              <Percentage :value="pool.meanFee" />
            </td>
            <td class="section__table__data">
              <Percentage :value="pool.medianFee" />
            </td>
            <td class="section__table__data">
              <RuneUSD :rune="pool.volume" />
            </td>
            <td class="section__table__data pool-list-apy">
              <div>{{ pool.apy }}%</div>
              <div class="apy-gauge">
                <div
                  class="apy-gauge__primary"
                  :style="{ width: (pool.apyRealRewards * 100) + '%' }"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Percentage from './Percentage.vue';
import RuneUSD from './RuneUSD.vue';

export default {
  components: {
    Percentage,
    RuneUSD,
  },
  data() {
    // TODO(Fede): this is tmp dummy data for building the front end, probably not a good idea to
    // build data here
    const poolIds = this.$store.state.pools.poolIds;
    return {
      pools: poolIds.map(pid => ({
        name: pid,
        slipageDepth: Math.round(Math.random() * 40000),
        meanFee: 0.001 + (Math.random() / 1000),
        medianFee: 0.001 + (Math.random() / 1000),
        volume: Math.round(Math.random() * 1000000),
        apy: Math.round(Math.random() * 100),
        apyRealRewards: Math.random() > 0.5 ? 0.5 : 0,
      })),
    };
  },
};
</script>

<style lang="scss" scoped>
.pool-list-table {
  width: 100%;
}

.pool-list-apy {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.apy-gauge {
  width: 80px;
  height: 6px;
  background-color: $color-green;
  border-radius: 3px;
}

.apy-gauge__primary {
  height: 6px;
  background-color: $color-purple;
  z-index: 1;
  border-radius: 3px;
  position: relative;
  left: -1px;
}
</style>
