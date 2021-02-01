<template>
  <div class="section">
    <SlippageCalculator />

    <div class="section__header pool-list-header">
      <h2 class="section__title section__title--inline">
        Pool list
      </h2>
      <div class="section__title__inputs">
        <div class="searchinput-wrapper">
          <Icon
            class="searchinput-icon"
            name="search"
            scale="0.7"
            @click="focusSearchInput"
          >
          </Icon>
          <input v-model="searchinput" placeholder="Search..." name="searchinput" ref="searchinputref">
        </div>
      </div>

      <div class="pool-list-time-selector">
        <button
          v-for="option in timeOptions"
          :key="option"
          class="pool-list-time-option"
          :class="{ 'pool-list-time-option--active': option === currentTimeOption }"
          @click="togglePeriod(option)"
        >
          {{ option }}
        </button>
      </div>

      <div
        class="slippage-calculator-toggle slippage-calculator-toggle--desktop"
        @click="$store.commit('modals/toggleSlippageCalculator')"
      >
        <img src="/calculator.svg"></img>
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
          <tr
            v-for="pool in pools"
            :key="pool.name"
            :class="selectedPools.indexOf(pool.name) === -1 ? 'section__table__row' : `section__table__row selectedpool__color${selectedPools.indexOf(pool.name)}`"
          >
            <td class="section__table__data section__table__data--highlight pool-list-pool">
         
          <!-- <label class="control control-checkbox">
            First checkbox
            <input type="checkbox" checked="checked" />
            <div class="control_indicator"></div>
          </label> -->

              <label class="container control control-checkbox">
                {{ pool.name }}
                <input type="checkbox"
                  v-model="selectedPools"
                  :value="pool.name"
                  :disabled="selectedPools.length > 4 && selectedPools.indexOf(pool.name) === -1"
                >
                <div class="control_indicator"></div>
              </label>
            </td>
            <td class="section__table__data pool-list-apy">
              <div>
                <Percentage :value="pool.apy" />
              </div>
              <!-- OLD <div v-if="pool.apy < 1000">
                <Percentage :value="pool.apy" />
              </div>
              <div v-if="pool.apy >= 1000">
                n/a
              </div> -->
              <!-- OLD <ApyGauge :apy-real-rewards="pool.apyRealRewards" :name="pool.name" /> -->
            </td>
            <td class="section__table__data">
                <RuneUSD :rune="pool.volume" />
              <!-- OLD <div v-if="pool.volume >= 1">
                <RuneUSD :rune="pool.volume" />
              </div>
              <div v-if="pool.volume < 1">
                n/a
              </div> -->
            </td>
            <td class="section__table__data">
              <RuneUSD :rune="pool.slippageDepth" />
            </td>
            <td class="section__table__data">
              <div v-if="!isNaN(pool.meanFeeAsPercentage)">
                <Percentage :value="pool.meanFeeAsPercentage" />
              </div>
              <div v-if="isNaN(pool.meanFeeAsPercentage)">
                n/a
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="slippage-calculator-toggle--mobile">
        <div
          class="slippage-calculator-toggle"
          @click="$store.commit('modals/toggleSlippageCalculator')"
        >
          <img src="/calculator.svg"></img>
          <p>
            Slippage Calculator
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Percentage from '../Common/Percentage.vue';
import RuneUSD from '../Common/RuneUSD.vue';

export default {
  components: {
    Percentage,
    RuneUSD,
  },
  data() {
    return {
      dummyRealRewards: Math.random(),
      timeOptions: ['all', '24h', '7d', '30d'],
      currentTimeOption: 'all',
      searchinput: '',
      selectedPools: [],
      fields: [
        {
          name: 'name',
          label: 'Pool',
        },
        {
          name: 'apy',
          label: 'APY',
        },
        {
          name: 'volume',
          label: 'Volume',
        },
        {
          name: 'slippageDepth',
          label: '1% Slippage Depth',
        },
        {
          name: 'meanFeeAsPercentage',
          label: 'Mean Fee',
        },
      ],
    };
  },
  computed: {
    pools() {
      const allPools =  this.$store.getters['pools/poolList'];
      const filteredPools = allPools.filter(p => p.name.toLowerCase().includes(this.searchinput.toLowerCase()));
      this.selectedPools.slice().reverse().forEach(selectedPool => {
        const selectedIndex = filteredPools.findIndex(fp => fp && fp.name === selectedPool);
        if (selectedIndex !== -1) {
          filteredPools.unshift(filteredPools.splice(selectedIndex, 1)[0]);
        }
      });
      return filteredPools;
    },
    sortBy() {
      return this.$store.state.pools.sortBy;
    },
    sortDescending() {
      return this.$store.state.pools.sortDescending;
    },
  },
  methods: {
    focusSearchInput() {
      this.$refs.searchinputref.focus()
    },
    togglePeriod(period) {
      const periodOptionsMap = {
        all: 'periodAll',
        '24h': 'period24h',
        '7d': 'period7d',
        '30d': 'period30d',
      };
      if (this.$store.period !== periodOptionsMap[period] && periodOptionsMap[period]) {
        this.currentTimeOption = period;
        this.$store.commit('pools/togglePeriod', periodOptionsMap[period]);
      }
    },
    toggleSort(fieldName) {
      if (fieldName === this.sortBy) {
        this.$store.commit('pools/toggleSortDescending');
      } else {
        this.$store.commit('pools/setSortBy', fieldName);
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
.section__title--inline {
  margin-right: 32px;
  flex: none;
}
.section__title__inputs {
  flex: 1;
}
.pool-list-time-selector {
  display: flex;
  height: 30px;
  margin-left: 20px;
  opacity: 0.6;
  justify-content: space-between;
  background-color: $color-bg-tint;
  border-radius: 15px;
  padding: 0 16px;
    margin-right: 16px;
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
  padding-right: 8px;

  &:last-child {
    padding-right: 0;
  }

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
.pool-list-pool > label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 220px;
}
.pool-list-apy {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.searchinput-wrapper {
    position: relative;
    .searchinput-icon {
      font-size: 12px;
      color: rgba(137, 140, 177, 0.7);
      font-size: 0.7em;
      position: absolute;
      top: 10px;
      left: 8px;
      cursor: text;
    }
    input {
      font-size: 13px;
      padding: 4px 8px 4px 25px;
      border: 1px solid rgba(112, 115, 150, 0.65);
      border-radius: 16px;
      background-color: transparent;
      font-family: Montserrat, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: rgb(190, 193, 226);
      caret-color: rgb(190, 193, 226);
      line-height: 16px;
      height: 30px;
    }
    input:focus {
      outline:none;
      border:1px solid rgba(120,124,170,0.95);
    }
}
.control {
  font-family: arial;
  display: block;
  position: relative;
  padding-left: 28px;
  margin-bottom: 6px;
  padding-top: 2px;
  cursor: pointer;
  font-size: 16px;
}
.control input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}
.control_indicator {
  position: absolute;
  top: 2px;
  left: 0;
  height: 16px;
  width: 16px;
  background: #e6e6e6;
  border: 0px solid #000000;
  border-radius: 4px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
  background: rgba(126, 128, 146, 0.70);
}
.control input:checked ~ .control_indicator {
  opacity: 1;
  background: #2aa1c0;
}

.selectedpool__color0 .control input:checked ~ .control_indicator {
    background: #4346D3;
}
.selectedpool__color1 .control input:checked ~ .control_indicator {
  background: #5E2BBC;
}
.selectedpool__color2 .control input:checked ~ .control_indicator {
  background: #F7517F;
}
.selectedpool__color3 .control input:checked ~ .control_indicator {
  background: #2D99FF;
}
.selectedpool__color4 .control input:checked ~ .control_indicator {
  background: #16CEB9;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
  opacity: 0.8;
}
.control input:disabled ~ .control_indicator {
  background:  rgba(126, 128, 146, 0.85);
  opacity: 0.6;
  pointer-events: none;
}
.control_indicator:after {
  box-sizing: unset;
  content: "";
  position: absolute;
  display: none;
}
.control input:checked ~ .control_indicator:after {
  display: block;
}
.control-checkbox .control_indicator:after {
  left: 6px;
  top: 2px;
  width: 3px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
  border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 4.5rem;
  height: 4.5rem;
  margin-left: -1.3rem;
  margin-top: -1.3rem;
  background: #2aa1c0;
  border-radius: 3rem;
  opacity: 0.6;
  z-index: 99999;
  transform: scale(0);
}
</style>
