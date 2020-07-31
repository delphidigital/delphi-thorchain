<template>
  <div class="section">
    <SlippageCalculator />

    <div class="section__header pool-list-header">
      <h2 class="section__title">
        Pool list
      </h2>

      <div class="pool-list-time-selector">
        <button
          v-for="option in timeOptions"
          :key="option"
          class="pool-list-time-option"
          :class="{ 'pool-list-time-option--active': option === currentTimeOption }"
          @click="currentTimeOption = option"
        >
          {{ option }}
        </button>
      </div>

      <div
        class="slippage-calculator-toggle"
        @click="$store.commit('modals/toggleSlippageCalculator')"
      >
        <img src="calculator.svg"></img>
        <p>
          Slippage Calculator
        </p>
      </div>
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
              <RuneUSD :rune="pool.slippageDepth" />
            </td>
            <td class="section__table__data">
              <Percentage :value="pool.meanFeeAsPercentage" />
            </td>
            <td class="section__table__data">
              n/a
            </td>
            <td class="section__table__data">
              <RuneUSD :rune="pool.volume" />
            </td>
            <td class="section__table__data pool-list-apy">
              <div><Percentage :value="pool.apy" /></div>
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
    return {
      timeOptions: ['24h', '7d', '30d'],
      currentTimeOption: '24h',
    };
  },
  computed: {
    pools() {
      return this.$store.getters['pools/poolList'];
    },
  },
};
</script>

<style lang="scss" scoped>
.pool-list-header {
  display: flex;
  align-items: center;
}

.pool-list-time-selector {
  display: flex;
  width: 120px;
  height: 30px;
  margin-left: 20px;
  justify-content: space-between;
  background-color: $color-bg-tint;
  border-radius: 15px;
  padding: 0 16px;
}

.pool-list-time-option {
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  background-color: transparent;
  border: none;
  margin: 0;
  padding: 0;

  &:hover, &:focus {
    border: none;
    outline: none;
  }
}

.slippage-calculator-toggle {
  padding: 0px 16px;
  height: 30px;
  margin-left: auto;
  display: flex;
  font-size: 13px;
  font-weight: 500;
  background-color: $color-bg-tint;
  border-radius: 15px;
  align-items: center;
  cursor: pointer;

  p {
    margin: 0;
    padding: 0;
    margin-left: 8px;
  }

  &:hover {
    border: 1px solid #fff;
  }
}

.pool-list-time-option--active {
  color: #fff;
}

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
