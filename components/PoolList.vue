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
        class="slippage-calculator-toggle slippage-calculator-toggle--desktop"
        @click="$store.commit('modals/toggleSlippageCalculator')"
      >
        <img src="calculator.svg"></img>
        <p>
          Slippage Calculator
        </p>
      </div>
    </div>

    <div class="section__body pool-list-section">
      <table class="section__table pool-list-table">
        <thead>
          <tr>
            <th
              v-for="field in fields"
              :key="field.name"
              class="section__table__head"
              @click="toggleSort(field.name)"
            >
              {{ field.label }}
              <span class="pool-list-sort-mark">
                {{ sortBy === field.name ? (sortDescending ? '▼' : '▲') : '&nbsp;' }}
              </span>
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
              <ApyGauge :apy-real-rewards="pool.apyRealRewards" :name="pool.name" />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="slippage-calculator-toggle--mobile">
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
    return {
      dummyRealRewards: Math.random(),
      timeOptions: ['24h', '7d', '30d'],
      currentTimeOption: '24h',
      sortBy: 'slippage',
      sortDescending: false,
      fields: [
        {
          name: 'name',
          label: 'Name',
        },
        {
          name: 'slippage',
          label: '1% Slippage Depth',
        },
        {
          name: 'meanFee',
          label: 'Mean Fee',
        },
        {
          name: 'medianFee',
          label: 'Median Fee',
        },
        {
          name: 'volume',
          label: 'Volume',
        },
        {
          name: 'apy',
          label: 'APY',
        },
      ],
    };
  },
  computed: {
    pools() {
      return this.$store.getters['pools/poolList'];
    },
  },
  methods: {
    toggleSort(fieldName) {
      if (fieldName === this.sortBy) {
        this.sortDescending = !this.sortDescending;
      } else {
        this.sortBy = fieldName;
        this.sortDescending = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.pool-list-header {
  display: flex;
  align-items: center;
  @media screen and (max-width: 500px) {
    justify-content: space-between;
  }
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
  justify-content: center;
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

.slippage-calculator-toggle--desktop {
  @media screen and (max-width: 500px) {
    display: none;
  }
}

.slippage-calculator-toggle--mobile {
  display: none;
  @media screen and (max-width: 500px) {
    display: block;
    padding: 10px;
    border-top: 1px solid $color-border;
  }
}

.pool-list-time-option--active {
  color: #fff;
}

.pool-list-section {
  @media screen and (max-width: $pureg-lg) {
    overflow-x: scroll;
  }
}

.pool-list-table {
  width: 100%;

  th {
    cursor: pointer;
  }

  @media screen and (max-width: $pureg-lg) {
    min-width: 700px;
  }
}

.pool-list-sort-mark {
  font-size: 7px;
  width: 7px;
  font-family: sans-serif;
  margin-left: 4px;
  color: #fff;
  opacity: 80%;
  display: inline-block;
  vertical-align: middle;
}

.pool-list-apy {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
