<template>
  <div class="section">
    <!-- <SlippageCalculator /> -->

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
              <span class="section__table__head--tooltip">
                <Icon
                  class="section__table__head--info"
                  name="info"
                  scale="0.4"
                  @click="focusSearchInput"
                >
                </Icon>
                <div class="app-tooltip table__head__tooltip">
                  <div class="app-tooltip__body">
                    {{field.info}}
                  </div>
                </div>
              </span>
              <span class="pool-list-sort-mark">
                {{ sortBy === field.name ? (sortDescending ? '▼' : '▲') : '&nbsp;' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="pool in pools"
            :key="pool.poolId"
            :class="selectedPools.indexOf(pool.poolId) === -1 ? 'section__table__row' : `section__table__row selectedpool__color${selectedPools.indexOf(pool.poolId)}`"
          >
            <td class="section__table__data section__table__data--highlight pool-list-pool">
              <label class="container control control-checkbox">
                {{ displayPoolName(pool.poolId) }}
                <input type="checkbox"
                  v-model="selectedPools"
                  :value="pool.poolId"
                  :disabled="selectedPools.length > 4 && selectedPools.indexOf(pool.poolId) === -1"
                >
                <div class="control_indicator"></div>
              </label>
            </td>
            <td class="section__table__data pool-list-apy">
              <div>
                <Percentage :value="pool.apy" />
              </div>
            </td>
            <td class="section__table__data">
              <span :class="(sortBy == 'poolId' || sortBy == 'volumeAverageUsd') ? 'column__highlight__colored' : ''">
                {{ formatLabel(pool.volumeAverageUsd) }}
              </span>
            </td>
            <td class="section__table__data">
              {{ formatLabel(pool.depthAverageUsd) }}
            </td>

            <td class="section__table__data">
              <div v-if="!isNaN(pool.volumeOverDepthRatio)">
                {{formatNumberDecimals(pool.volumeOverDepthRatio)}}
              </div>
              <div v-if="isNaN(pool.volumeOverDepthRatio)">
                n/a
              </div>
            </td>

            <td class="section__table__data">
              <div>
                <Percentage :value="pool.correllation" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="selectedPools.length > 0" class="section__linearvolume__chart">
        <div class="section__chart-title">
          <h3 class="section__subtitle">
            Volume of selected pools
          </h3>
        </div>
        <LineChart
          :data="selectedPoolsLinechartData"
          :format-label="formatLabel"
          :y-axis-label-options="yAxisLabelOptions"
        />
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import sortBy from 'sort-by';
import Percentage from '../Common/Percentage.vue';
import LineChart from './LineChart.vue';
import { periodsHistoryMap } from '../../store/pools';

export default {
  components: {
    Percentage,
    LineChart,
  },
  data() {
    return {
      dummyRealRewards: Math.random(),
      timeOptions: ['24H', '1W', '1M', '3M', '1Y'], // '6M' is not available at stats endpoint
      currentTimeOption: '1W',
      searchinput: '',
      selectedPools: [],
      sortBy: 'poolId',
      sortDescending: false,
      fields: [
        {
          name: 'poolId',
          label: 'Pool',
          info: 'The paired asset is always RUNE. Eg.: BTC : RUNE, ETH : RUNE',
        },
        {
          name: 'apy',
          label: 'APY',
          info: 'Calculation (make clear that it includes IL), MA used and definition of APY.',
        },
        {
          name: 'volumeAverageUsd',
          label: '24H Volume',
          info: 'Avg. 24h volume over the selected timeframe.',
        },
        {
          name: 'depthAverageUsd',
          label: 'Depth',
          info: 'Avg. depth over the selected timeframe.',
        },
        {
          name: 'volumeOverDepthRatio',
          label: 'V/D Ratio',
          info: 'A metric which indicates a pool’s potential. A higher number means higher potential.',
        },
        {
          name: 'correllation',
          label: 'Correllation',
          info: 'A metric which indicates a pool’s risk. A higher number indicates lower risk as assets are more correlated, there’s a lower risk of impermanent loss.',
        },
      ],
      yAxisLabelOptions: {
        type: 'linear',
        title: {
          text: 'Volume',
          useHTML: true,
          style: {
            color: 'rgba(255,255,255,0.7)',
          }
        },
      }
    };
  },
  computed: {
    pools() {
      const unsortedPools = Object.keys(this.$store.state.pools.technicalAnalysis).map((poolId) => {
        const period = periodsHistoryMap[this.currentTimeOption];
        const poolPeriodTA = this.$store.state.pools.technicalAnalysis[poolId][period];
        const volumeOverDepthRatio = poolPeriodTA.totalVolume / poolPeriodTA.totalDepth;
        return {
          ...poolPeriodTA,
          poolId,
          volumeOverDepthRatio,
        };
      })
      const descChar = this.sortDescending ? '-' : '';
      const sortedPools = unsortedPools.sort(sortBy(`${descChar}${this.sortBy}`));
      const filteredPools = sortedPools
        .filter(p => p.poolId.toLowerCase().includes(this.searchinput.toLowerCase()));
      this.selectedPools.slice().reverse().forEach(selectedPool => {
        const selectedIndex = filteredPools.findIndex(fp => fp && fp.poolId === selectedPool);
        if (selectedIndex !== -1) {
          filteredPools.unshift(filteredPools.splice(selectedIndex, 1)[0]);
        }
      });
      return filteredPools;
    },
    selectedPoolsLinechartData() {
      const poolTA = this.$store.state.pools.technicalAnalysis
      const colorsList = ['#4346D3', '#5E2BBC', '#F7517F', '#2D99FF', '#16CEB9'];
      const period = periodsHistoryMap[this.currentTimeOption];
      const data = this.selectedPools.map((sp, colorIndex) => {
        const periodTA = poolTA[sp][period];
        return {
          name: sp,
          data: Object.keys(periodTA.intervalSwaps).map(timestamp => {
            return {
              x: (parseInt(periodTA.intervalSwaps[timestamp].startTime)*1000),
              y: periodTA.intervalSwaps[timestamp].totalVolumeUsd,
            }
          }),
          color: colorsList[colorIndex],
        };
      });
      return data;
    },
  },
  methods: {
    displayPoolName(poolId) {
      if (poolId.length > 16) {
        return `${poolId.slice(0, 16)}...`;
      }
      return poolId;
    },
    focusSearchInput() {
      this.$refs.searchinputref.focus()
    },
    formatLabel(value) {
      return numeral(value).format('($0,0a)').toUpperCase();
    },
    formatNumberDecimals(value){
      return value.toFixed(2);
    },
    togglePeriod(period) {
      if (this.currentTimeOption !== period) {
        this.currentTimeOption = period;
      }
    },
    toggleSort(fieldName) {
      if (fieldName === this.sortBy) {
        this.sortDescending = !this.sortDescending;
      } else {
        this.sortBy = fieldName;
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

/* .slippage-calculator-toggle {
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
} */

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
  .section__table__head--info {
    font-size: 0.4em;
    width: 12px;
    height: 12px;
    background-color: rgb(120, 124, 161);
    padding: 3px;
    border-radius: 8px;
    color: rgb(27, 28, 41);
    vertical-align: middle;
    line-height: 1;
    margin-left: 4px;
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
.pool-list-pool label {
  white-space: nowrap;
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
.selectedpool__color0 {
  .control input:checked ~ .control_indicator {
    background: #4346D3;
  }
  .column__highlight__colored {
    border: 1px solid #4346D3;
    padding: 6px 8px;
    border-radius: 40%;
  }
}
.selectedpool__color1 {
  .control input:checked ~ .control_indicator {
    background: #5E2BBC;
  }
  .column__highlight__colored {
    border: 1px solid #5E2BBC;
    padding: 6px 8px;
    border-radius: 40%;
  }
}
.selectedpool__color2 {
  .control input:checked ~ .control_indicator{
    background: #F7517F;
  }
  .column__highlight__colored {
    border: 1px solid #F7517F;
    padding: 6px 8px;
    border-radius: 40%;
  }
}
.selectedpool__color3 {
  .control input:checked ~ .control_indicator {
    background: #2D99FF;
  }
  .column__highlight__colored {
    border: 1px solid #2D99FF;
    padding: 6px 8px;
    border-radius: 40%;
  }
}
.selectedpool__color4 {
  .control input:checked ~ .control_indicator {
    background: #16CEB9;
  }
  .column__highlight__colored {
    border: 1px solid #16CEB9;
    padding: 4px 6px;
    border-radius: 40%;
  }
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
.section__table__head--tooltip {
  position: relative;
  z-index: 10;

  .table__head__tooltip {
    display: none;
    position: absolute;
    top: calc(100% + 20px);
    right: calc(50% - 125px);
    background-color: $color-bg-popup;
    border-radius: 4px;
    width: 250px;
    text-transform: none;
  }

  .table__head__tooltip:before {
    content: "";
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid $color-bg-popup;
    top: -6px;
    left: calc(50% - 6px);
  }

  &:hover {
    .table__head__tooltip {
      display: block;
    }
  }
}
.section__linearvolume__chart{
  background-color: #262f4a;
  border-top: 1px solid #353C50;
  padding: 15px 25px;
}
</style>
