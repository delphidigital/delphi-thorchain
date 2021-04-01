<template>
  <div class="section">

    <div class="section__header top-performers-header" id="top-performers">
      <h2 class="section__title">
        Top Performers
      </h2>

      <div class="top-performers-time-selector">
        <button
          v-for="option in timeOptions"
          :key="option"
          class="top-performers-time-option"
          :class="{ 'top-performers-time-option--active': option === currentTimeOption }"
          @click="togglePeriod(option)"
        >
          {{ option }}
        </button>
      </div>
      <a class="deeplink-selector" href="#top-performers">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
      <a class="tweet__link" :href="tweetTopPerformers" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
    </div>

    <div class="section__body top-performers-section">
      <table class="section__table top-performers-table">
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
                >
                </Icon>
                <div class="app-tooltip table__head__tooltip">
                  <div class="app-tooltip__body">
                    {{ field.info }}
                  </div>
                </div>
              </span>
              <span class="top-performers-sort-mark">
                {{ sortBy === field.name ? (sortDescending ? '▼' : '▲') : '&nbsp;' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pool in pools" :key="pool.poolId" class="section__table__row">
            <td class="section__table__data section__table__data--highlight">
                {{ displayPoolName(pool.poolId) }}
            </td>
            <td class="section__table__data top-performers-apy">
              <div>
                <Percentage :value="pool.apy" />
                <!-- {{ pool.apy.toFixed(2) }}% -->
              </div>
            </td>
            <td class="section__table__data">
              <span>
                <!-- {{ (pool.impermanentLoss || 0).toFixed(2) }}% -->
                <Percentage :value="(pool.impermanentLoss || 0)" />
              </span>
            </td>

            <td class="section__table__data">
              <div>
                <!-- Rewards was  pool.totalEarningsRune --> 
                <Percentage :value="(pool.rewards || 0)" />
              </div>
            </td>

            <td class="section__table__data">
              {{ formatLabelDepth(pool.totalDepthUsd) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import sortBy from 'sort-by';
import Percentage from '../Common/Percentage.vue';
import RuneUSD from '../Common/RuneUSD.vue';
import { periodsHistoryMap, periodToStatsMap } from '../../store/pools';
import { poolNameWithoutAddr } from '../../lib/utils';
import { getInvervalsFromPeriodKey, calculateFeeAPY, getTopPerformers, e8ValueParser, getPoolDailyEarningsAfter } from '../../lib/ta';

export default {
  components: {
    Percentage,
    RuneUSD,
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = '/thorchain/testnet'; // TODO: include mainnet too
    const topPerformersDeepLink = `${baseUrl}${tabBasePath}#top-performers`;
    return {
      tweetTopPerformers: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Top performers')}&url=${encodeURIComponent(topPerformersDeepLink)}`,
      timeOptions: ['1W', '1M', '3M', '1Y'], // '6M' is not available at stats endpoint
      currentTimeOption: '1W',
      sortBy: 'totalEarningsRune',
      sortDescending: true,
      fields: [
        {
          name: 'poolId',
          label: 'Pool',
          info: 'Read as Chain.Asset, eg: for wrapped bitcoin (asset) on ethereum (chain) it would read ETH.wBTC',
        },
        {
          name: 'apy',
          label: 'APY',
          info: 'Average APY over the selected period including impermanent loss.',
        },
        {
          name: 'impermanentLoss',
          label: 'IL',
          info: 'Impermanent loss over the selected period. Thorchain’s impermanent loss protection covers 1% of IL accrued per day.',
        },
        {
          name: 'rewards', // 'totalEarningsRune'
          label: 'Rewards',
          info: 'Accrued rewards over the selected period.',
        },
        {
          name: 'totalDepthUsd',
          label: 'Depth',
          info: 'Current depth of the pool.',
        },
      ],
    };
  },
  computed: {
    pools() {
      const topPerformers = getTopPerformers(
        this.$store.state.pools.poolHistoryDepths, // history depths
        periodsHistoryMap[this.currentTimeOption], // history detphs period key
        this.$store.state.pools.pools, // pool stats
        periodToStatsMap[this.currentTimeOption],  // stats period key
      );
      const poolsDepths = getInvervalsFromPeriodKey(
        this.$store.state.pools.poolHistoryDepths,
        periodsHistoryMap[this.currentTimeOption],
      );
      const unsortedPools = topPerformers.map(({ poolId, apy, intervalsWithFeesAndImpLoss }) => {
        // const period = periodsHistoryMap[this.currentTimeOption];
        // const poolPeriodTA = this.$store.state.pools.technicalAnalysis[poolId][period];
        const poolStats = this.$store.state.pools.pools.find(p => p.poolId === poolId).poolStats;
        const poolPeriodStats = poolStats[periodToStatsMap[this.currentTimeOption]];
        // const poolsOverviewPeriod = this.$store.state.pools.poolsOverview[poolId][period];
        // const periodIntervals = Object.keys(intervalsCalculations).map(i => parseInt(i, 10)).sort();
        // the impermanent loss of the entire period is the last interval IL
        // const lastInterval = periodIntervals[periodIntervals.length-1];
        let assetPriceUSD = parseFloat(poolPeriodStats.assetPriceUSD);
        let assetDepth = e8ValueParser(poolPeriodStats.assetDepth);
        if (isNaN(assetPriceUSD)) { assetPriceUSD = 0; }
        if (isNaN(assetDepth)) { assetDepth = 0; }

        // (allPoolsHistoryEarnings, startTime, poolId) => {
        // this.$store.state.pools.allPoolsHistoryEarnings.period1Y.intervals[0].startTime
        // const startTime = parseInt(intervalsWithFeesAndImpLoss[0].timestamp, 10);
        // const dailyPoolEarningsAfter = getPoolDailyEarningsAfter(this.$store.state.pools.allPoolsHistoryEarnings, startTime, poolId)
        // console.log(dailyPoolEarningsAfter);
        // const rewards = dailyPoolEarningsAfter.reduce((acc, next) => acc + e8ValueParser(next.rewards), 0);calculateFeeAPY

        
        // const poolDepthIntervals = poolsDepths
        //   .find(pd => pd.poolId === poolId).intervals.filter(di => parseInt(di.liquidityUnits, 10) > 0);

        // const apyValues = [];
        // poolDepthIntervals.forEach((pdi, idx) => {
        //   const next = poolDepthIntervals[idx+1];
        //   if (!next) {
        //     return;
        //   }
        //   apyValues.push(calculateFeeAPY([pdi, next]));
        // });
        // const apyAverageValues = apyValues.length
        //   ? (apyValues.reduce((acc, next) => acc + next) / apyValues.length)
        //   : 0;

        // const apy2 = calculateFeeAPY(poolDepthIntervals)
        return {
          poolId,
          totalDepthUsd: (assetDepth * assetPriceUSD * 2),
          impermanentLoss: intervalsWithFeesAndImpLoss[intervalsWithFeesAndImpLoss.length - 1].impermLoss,
          apy: parseFloat(apy),
           // NOTE: Maybe show .totalGains ?
          rewards: intervalsWithFeesAndImpLoss[intervalsWithFeesAndImpLoss.length - 1].feeAccrued,
        };
      });
      const descChar = this.sortDescending ? '-' : '';
      return unsortedPools.sort(sortBy(`${descChar}${this.sortBy}`));
    },
  },
  methods: {
    displayPoolName(poolId) {
      return poolId ? poolNameWithoutAddr(poolId) : poolId;
    },
    formatLabelDepth(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('($0,0)').replace(',','.')}K`;
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
.top-performers-header {
  display: flex;
  align-items: center;
  @media screen and (max-width: 500px) {
    justify-content: space-between;
  }
}
.section__title__inputs {
  flex: 1;
}
.top-performers-time-selector {
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

.top-performers-time-option {
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

.top-performers-time-option--active {
  color: #fff;
}

.top-performers-section {
  @media screen and (max-width: $pureg-lg) {
    overflow-x: scroll;
  }
}

.top-performers-table {
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

.top-performers-sort-mark {
  font-size: 7px;
  width: 7px;
  font-family: sans-serif;
  margin-left: 4px;
  color: #fff;
  opacity: 80%;
  display: inline-block;
  vertical-align: middle;
}
.top-performers-apy {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
