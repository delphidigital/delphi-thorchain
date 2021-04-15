<template>
  <div class="section">
    <!-- <SlippageCalculator /> -->

    <div class="section__header pool-list-header" id="pools-list">
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
      <a class="deeplink-selector" href="#pools-list">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
      <a class="tweet__link" :href="tweetPoolList" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
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
            v-for="pool in poolsSelected"
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
                <span
                  :class="(sortBy == 'averagePeriodAPY') ? 'column__highlight__colored' : ''"
                  @click="changeColumn('averagePeriodAPY')"
                >
                  <Percentage :value="pool.averagePeriodAPY" />
                </span>
              </div>
            </td>
            <td class="section__table__data">
              <span
                :class="(sortBy == 'poolId' || sortBy == 'volumeAverageUsd') ? 'column__highlight__colored' : ''"
                @click="changeColumn('volumeAverageUsd')"
              >
                {{ formatLabel(pool.volumeAverageUsd) }}
              </span>
            </td>
            <td class="section__table__data">
              <span
                :class="(sortBy == 'totalDepthUsd') ? 'column__highlight__colored' : ''"
                @click="changeColumn('totalDepthUsd')"
              >
                {{ formatLabelDepth(pool.totalDepthUsd) }}
              </span>
            </td>

            <td class="section__table__data">
              <div v-if="!isNaN(pool.volumeOverDepthRatio)">
                <span
                  :class="(sortBy == 'volumeOverDepthRatio') ? 'column__highlight__colored' : ''"
                  @click="changeColumn('volumeOverDepthRatio')"
                >
                {{formatNumberDecimals(pool.volumeOverDepthRatio)}}
                </span>
              </div>
              <div v-if="isNaN(pool.volumeOverDepthRatio)">
                <span @click="changeColumn('volumeOverDepthRatio')">
                  n/a
                </span>
              </div>
            </td>

            <td class="section__table__data">
              <span
                :class="(sortBy == 'lastCorrellation') ? 'column__highlight__colored' : ''"
                @click="changeColumn('lastCorrellation')"
              >
                {{(pool.lastCorrellation || 0).toFixed(2)}}
              </span>
            </td>
          </tr>


          <tr v-if="selectedPools.length > 0">
            <td colspan="6">
              <div class="section__linearvolume__chart">
                <div class="section__chart-title">
                  <h3 class="section__subtitle">
                    {{ selectedPoolsChartTitle.title }}
                  </h3>
                </div>
                <div v-if="enoughDataForLineChart">
                  <LineChart
                    :data="selectedPoolsLinechartData"
                    :format-label="formatYValueTooltip"
                    :y-axis-label-options="yAxisLabelOptions"
                  />
                </div>
                <div v-else class="not-enough-data-msg">
                  Not enough data
                </div>
              </div>
            </td>
          </tr>


          <tr
            v-for="pool in poolsNotSelected"
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
                <span
                  :class="(sortBy == 'averagePeriodAPY') ? 'column__highlight__colored' : ''"
                  @click="changeColumn('averagePeriodAPY')"
                >
                  <Percentage :value="pool.averagePeriodAPY" />
                </span>
              </div>
            </td>
            <td class="section__table__data">
              <span
                :class="(sortBy == 'poolId' || sortBy == 'volumeAverageUsd') ? 'column__highlight__colored' : ''"
                @click="changeColumn('volumeAverageUsd')"
              >
                {{ formatLabel(pool.volumeAverageUsd) }}
              </span>
            </td>
            <td class="section__table__data">
              <span
                :class="(sortBy == 'totalDepthUsd') ? 'column__highlight__colored' : ''"
                @click="changeColumn('totalDepthUsd')"
              >
                {{ formatLabelDepth(pool.totalDepthUsd) }}
              </span>
            </td>

            <td class="section__table__data">
              <div v-if="!isNaN(pool.volumeOverDepthRatio)">
                <span
                  :class="(sortBy == 'volumeOverDepthRatio') ? 'column__highlight__colored' : ''"
                  @click="changeColumn('volumeOverDepthRatio')"
                >
                {{formatNumberDecimals(pool.volumeOverDepthRatio)}}
                </span>
              </div>
              <div v-if="isNaN(pool.volumeOverDepthRatio)">
                <span @click="changeColumn('volumeOverDepthRatio')">
                  n/a
                </span>
              </div>
            </td>

            <td class="section__table__data">
              <span
                :class="(sortBy == 'lastCorrellation') ? 'column__highlight__colored' : ''"
                @click="changeColumn('lastCorrellation')"
              >
                {{(pool.lastCorrellation || 0).toFixed(2)}}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import getUnixTime from 'date-fns/getUnixTime';
import numeral from 'numeral';
import sortBy from 'sort-by';
import Percentage from '../Common/Percentage.vue';
import LineChart from './LineChart.vue';
import { periodsHistoryMap, runeDivider } from '../../store/pools';
import { poolNameWithoutAddr } from '../../lib/utils';
import { technicalAnalysis, periodKeyToSecondsMap, simpleMovingAverage, periodKeyToDataPointsMovingAvg } from '../../lib/ta';

export default {
  components: {
    Percentage,
    LineChart,
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const poolListDeepLink = `${baseUrl}${tabBasePath}#pools-list`;
    return {
      tweetPoolList: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Pool list')}&url=${encodeURIComponent(poolListDeepLink)}`,
      dummyRealRewards: Math.random(),
      timeOptions: ['24H', '1W', '1M', '3M', '1Y'], // '6M' is not available at stats endpoint
      currentTimeOption: '1W',
      searchinput: '',
      selectedPools: [],
      sortBy: 'volumeAverageUsd',
      sortDescending: true,
      fields: [
        {
          name: 'poolId',
          label: 'Pool',
          info: 'Read as Chain.Asset, eg: for wrapped bitcoin (asset) on ethereum (chain) it would read ETH.wBTC',
        },
        {
          name: 'averagePeriodAPY',
          label: 'APY',
          info: 'Current APY excluding impermanent loss. The APY is smoothed by a moving average, to reflect a more representative figure.',
        },
        {
          name: 'volumeAverageUsd',
          label: '24H Volume',
          info: 'Average 24h volume over the selected period.',
        },
        {
          name: 'totalDepthUsd',
          label: 'Depth',
          info: 'Current depth of the pool.',
        },
        {
          name: 'volumeOverDepthRatio',
          label: 'V/D Ratio',
          info: 'A metric which indicates a pool’s potential. A higher number means higher demand.',
        },
        {
          name: 'lastCorrellation',
          label: 'Correllation',
          info: 'Price divergence between ASSET and RUNE. A high correllation is favorable (close to 1). it indicates a lower chance of IL.',
        },
      ],
    };
  },
  computed: {
    yAxisLabelOptions() {
      let text = 'Volume';
      if (this.sortBy === 'averagePeriodAPY') {
        text = 'APY';
      } else if (this.sortBy === 'totalDepthUsd') {
        text = 'Depth';
      } else if (this.sortBy === 'volumeOverDepthRatio') {
        text = 'V/D Ratio';
      } else if (this.sortBy === 'lastCorrellation') {
        text = 'Correlation';
      }
      return {
        type: 'linear',
        title: {
          text,
          useHTML: true,
          style: {
            fontSize: '10px',
            color: 'rgba(255,255,255,0.7)',
          }
        },
      };
    },
    poolsTA() {
      const poolHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      const poolHistorySwaps = this.$store.state.pools.poolHistorySwaps;
      const allPoolsHistoryEarnings = this.$store.state.pools.allPoolsHistoryEarnings;
      const periodKey = periodsHistoryMap[this.currentTimeOption];

      const ta = technicalAnalysis(
        poolHistoryDepths, poolHistorySwaps, allPoolsHistoryEarnings, periodKey
      );
      return ta;
    },
    pools() {
      const period = periodsHistoryMap[this.currentTimeOption];
      // const poolHistoryDepths = this.$store.state.pools.poolHistoryDepths;
      // poolId apy volumeAverageUsd depthAverageUsd volumeOverDepthRatio correllation
      // const poolsDepths = getInvervalsFromPeriodKey(poolHistoryDepths, period);
      // const timeOptionToDaysMap = {
      //   '24H': 1,
      //   '1W': 7,
      //   '1M': 30,
      //   '3M': 90,
      //   '1Y': 365,
      // };
      const unsortedPools = Object.keys(this.poolsTA).map((poolId) => {
        const poolPeriodTA = this.poolsTA[poolId][period];
        const volumeOverDepthRatio = poolPeriodTA
          ? ((poolPeriodTA.totalVolumeUsd / poolPeriodTA.totalDepthUsd))
          : 0;
        // const periodStatsKey = periodToStatsMap[this.currentTimeOption];
        // const averagePeriodAPY = parseFloat(
        //   this.$store.state.pools.pools.find(p => p.poolId === poolId).poolStats[periodStatsKey].poolAPY
        // );
        // const volumeAverageUsd = (poolPeriodTA.totalVolume * this.$store.state.runeMarketData.priceUSD);
        const totalVolumeUsd = (poolPeriodTA.totalVolume * this.$store.state.runeMarketData.priceUSD);
        const intervalsN = Object.keys(poolPeriodTA.intervalSwaps).length;
        const eachIntervalVolumeAverageUsd = intervalsN ? (totalVolumeUsd / intervalsN) : 0;
        const periodKeyToDayDatapoints = {
          period24H: 24, // hours
          period1W: 24, // hours
          period1M: 24, // hours
          period1HM: 24, // hours
          period3M: 1, // days
          period6M: 1, // days
          period1Y: 1, // days
        };
        // NOTE: calc average for total volume in the period, only by the available intervals.
        // So if we are at 3M period, but only 5 day intervals available instead of 90, it averages the volume
        // over 5 and uses that as the 24h volume avg.
        // For the case of hourly intervals (e.g.: month, week and 24h period), it calculates the hourly average
        // and then multiplies that average by 24.
        const volumeAverageUsd = periodKeyToDayDatapoints[period] * eachIntervalVolumeAverageUsd;
        return {
          ...poolPeriodTA,
          poolId,
          volumeOverDepthRatio,
          volumeAverageUsd,
          // averagePeriodAPY,
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
    poolsSelected() {
      const descChar = this.sortDescending ? '-' : '';
      return this.pools
        .filter(p => this.selectedPools.includes(p.poolId))
        .sort(sortBy(`${descChar}${this.sortBy}`));
    },
    poolsNotSelected() {
      return this.pools.filter(p => !this.selectedPools.includes(p.poolId));
    },
    selectedPoolsChartTitle() {
      if (this.sortBy === 'averagePeriodAPY') {
        return { title: 'APY of selected pools' };
      } else if (this.sortBy === 'totalDepthUsd') {
        return { title: 'Depth of selected pools' };
      } else if (this.sortBy === 'volumeOverDepthRatio') {
        return { title: 'V/D of selected pools' };
      } else if (this.sortBy === 'lastCorrellation') {
        return { title: 'Correllation of selected pools' };
      }
      return { title: 'Volume of selected pools' };
    },
    selectedPoolsLinechartData() {
      const colorsList = ['#4346D3', '#5E2BBC', '#F7517F', '#2D99FF', '#16CEB9'];
      const period = periodsHistoryMap[this.currentTimeOption];
      const periodResolutionKey = ['period24H', 'period1W', 'period1M'].find(k => k === period) ? 'period1HM' : 'period1Y';
      const secondsElapsedSincePeriod = periodKeyToSecondsMap[period];
      const startTime = getUnixTime(new Date()) - secondsElapsedSincePeriod;
      const movingAvgLength = periodKeyToDataPointsMovingAvg[period];
      const data = this.selectedPools.map((sp, colorIndex) => {
        const pname = this.displayPoolName(sp);
        if (this.sortBy === 'averagePeriodAPY') {
          const poolTA = this.poolsTA;
          const periodTA = poolTA[sp][period];
          const ret = {
            name: pname,
            // data: poolData,
            data: Object.keys(periodTA.intervals)
              .sort((a,b) => (parseInt(a) - parseInt(b)))
              .map(intervalKey => {
                return {
                  x: (parseInt(periodTA.intervals[intervalKey].startTime, 10) * 1000),
                  y: periodTA.intervals[intervalKey].periodAPY_MA,
                };
              }),
            color: colorsList[colorIndex],
          };
          return ret;
        } else if (this.sortBy === 'totalDepthUsd') {
          const poolDepths = this.$store.state.pools.poolHistoryDepths
          const periodDepths = poolDepths[sp][periodResolutionKey];
          const periodIntervals = periodDepths.intervals;
          const periodIntervalsLinechartData = periodIntervals.map(pd => ({
            x: (parseInt(pd.startTime, 10) * 1000),
            y: ((parseInt(pd.assetDepth, 10) / runeDivider) * parseFloat(pd.assetPriceUSD) * 2),
          }));
          const finalData = simpleMovingAverage(periodIntervalsLinechartData, 'y', movingAvgLength)
            .filter(i => i.x >= startTime * 1000);
          return {
            name: pname,
            data: finalData,
            color: colorsList[colorIndex],
          };
        } else if (this.sortBy === 'volumeOverDepthRatio') {
          const poolHD = this.$store.state.pools.poolHistoryDepths;
          const poolTA = this.poolsTA;
          const periodTA = poolTA[sp][period];
          const periodDepths = poolHD[sp][periodResolutionKey];
          const periodIntervalsLinechartData = periodDepths.intervals.map(pd => {
            const totalVolume = periodTA.intervalSwaps[pd.startTime]?.totalVolumeUsd || 0;
            const assetDepth = (parseInt(pd.assetDepth, 10) / runeDivider) * pd.assetPriceUSD;
            const y = assetDepth ? (totalVolume/assetDepth) : 0;
            return {
              x: (parseInt(pd.startTime, 10) * 1000),
              y,
            }
          });
          const finalData = simpleMovingAverage(periodIntervalsLinechartData, 'y', movingAvgLength)
            .filter(i => i.x >= startTime * 1000);
          const ret = {
            name: pname,
            data: finalData,
            color: colorsList[colorIndex],
          };
          return ret;
        } else if (this.sortBy === 'lastCorrellation') {
          const poolTA = this.poolsTA
          const periodTA = poolTA[sp][period];
          const periodIntervalsLinechartData = Object.keys(periodTA.intervals).map(timestamp => ({
            x: (parseInt(periodTA.intervals[timestamp].startTime)*1000),
            y: periodTA.intervals[timestamp].correllation,
          }));
          const finalData = simpleMovingAverage(periodIntervalsLinechartData, 'y', movingAvgLength)
            .filter(i => i.x >= startTime * 1000);
          return {
            name: pname,
            data: finalData,
            color: colorsList[colorIndex],
          };
        } else { // if (this.chartedValue === 'volumeAverageUsd') {
          const poolTA = this.poolsTA
          const periodTA = poolTA[sp][period];
          const periodIntervalsLinechartData = Object.keys(periodTA.intervalSwaps).map(timestamp => ({
            x: (parseInt(periodTA.intervalSwaps[timestamp].startTime)*1000),
            y: periodTA.intervalSwaps[timestamp].totalVolumeUsd,
          }));
          const finalData = simpleMovingAverage(periodIntervalsLinechartData, 'y', movingAvgLength)
            .filter(i => i.x >= startTime * 1000);
          return {
            name: pname,
            data: finalData,
            color: colorsList[colorIndex],
          };
        }
      });
      return data;
    },
    enoughDataForLineChart() {
      if (!this.selectedPoolsLinechartData.length) { return false; }
      return this.selectedPoolsLinechartData.some(pd => pd.data.length);
    }
  },
  methods: {
    displayPoolAPY(value) {
      return `${((value || 0.0)*100).toFixed(2)}%`;
    },
    displayPoolName(poolId) {
      return poolId ? poolNameWithoutAddr(poolId) : poolId;
    },
    focusSearchInput() {
      this.$refs.searchinputref.focus()
    },
    formatYValueTooltip(value) {
      if (this.sortBy === 'averagePeriodAPY') {
        return this.displayPoolAPY(value);
      } else if (this.sortBy === 'volumeOverDepthRatio' || this.sortBy === 'lastCorrellation') {
        return `${(value || 0.0).toFixed(2)}`;
      }
      return this.formatLabel(value);
    },
    formatLabelDepth(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('($0,0)').replace(',','.')}K`;
    },
    formatLabel(value) {
      return numeral(value).format('($0,00.00a)').toUpperCase();
    },
    formatNumberDecimals(value){
      return value.toFixed(2);
    },
    togglePeriod(period) {
      if (this.currentTimeOption !== period) {
        this.currentTimeOption = period;
      }
    },
    changeColumn(fieldName) {
      if (fieldName !== this.sortBy) {
        this.sortBy = fieldName;
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

  @media screen and (max-width: $pureg-lg) {
    height: 30px; margin-left: 10px; padding: 0 8px; margin-right: 10px;
  }
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
    padding-left: 22px;
    text-align: center;
    &:first-child {
      text-align: left;
    }
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

  .section__table__row {
    .section__table__data {
      text-align: center;
      > div, > span {
        text-align: center;
        margin: auto;
      }
      &:first-child {
        text-align: left;
      }
    }

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
.not-enough-data-msg {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  padding: 20px;
  padding-bottom: 40px;
}
</style>
