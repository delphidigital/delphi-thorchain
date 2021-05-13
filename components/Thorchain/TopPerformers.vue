<template>
  <div class="section">

    <div class="section__header top-performers-header" id="top-performers">
      <h2 class="section__title">
        Top Performers

        <span class="section__title--tooltip">
          <Icon
            class="tooltip__hover--info"
            name="info"
            scale="0.4"
          >
          </Icon>
          <div class="app-tooltip section__title__tooltip">
            <div class="app-tooltip__body">
              A list of the top performing liquidity pools over the selected time period.
            </div>
          </div>
        </span>
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
                  class="tooltip__hover--info"
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

            <!-- <td class="section__table__data">
              <div>
                <Percentage :value="(pool.rewards || 0)" />
              </div>
            </td> -->

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
import { getInvervalsFromPeriodKey, e8ValueParser } from '../../lib/ta';

export default {
  components: {
    Percentage,
    RuneUSD,
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const topPerformersDeepLink = `${baseUrl}${tabBasePath}#top-performers`;
    return {
      tweetTopPerformers: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Top performers')}&url=${encodeURIComponent(topPerformersDeepLink)}`,
      timeOptions: ['1W', '1M', '3M', '1Y'], // '6M' is not available at stats endpoint
      currentTimeOption: '1W',
      sortBy: 'apy',
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
          info: 'Average APY over the selected period, excluding impermanent loss.',
        },
        {
          name: 'impermanentLoss',
          label: 'IL',
          info: 'Impermanent loss over the selected period. Thorchain’s impermanent loss protection covers 1% of IL accrued per day.',
        },
        // {
        //   name: 'rewards', // 'totalEarningsRune'
        //   label: 'Rewards',
        //   info: 'Accrued rewards over the selected period.',
        // },
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
      const taPeriods = this.$store.state.pools.taPeriods;
      const periodKey = periodsHistoryMap[this.currentTimeOption];
      const periodTA = taPeriods[periodKey];
      const poolsDepths = getInvervalsFromPeriodKey(this.$store.state.pools.poolHistoryDepths, periodKey);
      const topPerformers = poolsDepths.map(pd => ({
        poolId: pd.poolId,
        apy: this.$store.state.pools.pools.find(p => p.poolId === pd.poolId).poolStats[periodToStatsMap[this.currentTimeOption]].poolAPY,
        ta: periodTA[pd.poolId][periodKey],
      }));
      const unsortedPools = topPerformers.map(({ poolId, apy, ta }) => {
        const poolStats = this.$store.state.pools.pools.find(p => p.poolId === poolId).poolStats;
        const poolPeriodStats = poolStats[periodToStatsMap[this.currentTimeOption]];
        let assetPriceUSD = parseFloat(poolPeriodStats.assetPriceUSD);
        let assetDepth = e8ValueParser(poolPeriodStats.assetDepth);
        if (isNaN(assetPriceUSD)) { assetPriceUSD = 0; }
        if (isNaN(assetDepth)) { assetDepth = 0; }
        const impermanentLoss = ta.intervals[ta.lastIntervalStartTime].impermanentLoss || 0;
        return {
          poolId,
          totalDepthUsd: (assetDepth * assetPriceUSD * 2),
          impermanentLoss,
          apy: ta.averagePeriodAPY,
          // apy: parseFloat(apy), // NOTE: this is the avg. APY from stats endpoint
          // NOTE: Maybe show .totalGains ?
          // rewards: intervalsWithFeesAndImpLoss[intervalsWithFeesAndImpLoss.length - 1].feeAccrued,
        };
      });
      const descChar = this.sortDescending ? '-' : '';
      return unsortedPools.sort(sortBy(`${descChar}${this.sortBy}`)).slice(0, 10);
    },
  },
  methods: {
    displayPoolName(poolId) {
      return poolId ? poolNameWithoutAddr(poolId) : poolId;
    },
    formatLabelDepth(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('($0,0)')}K`;
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
.section__table__head:not(:first-child) {
  text-align: center;
  &:last-child {
    padding-left: 10px;
  }
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
.section__table__row > .section__table__data:not(:first-child) {
  text-align: center;
  > div, > span {
    margin: auto;
  }
}
</style>
