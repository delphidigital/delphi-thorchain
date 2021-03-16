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
              </div>
            </td>
            <td class="section__table__data">
              <span>
                {{ (pool.impermanentLoss || 0).toFixed(4) }}
              </span>
            </td>

            <td class="section__table__data">
              <div>
                <!-- Rewards -->
                <RuneUSD :rune="pool.totalEarningsRune" />
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
import { periodsHistoryMap } from '../../store/pools';
import { poolNameWithoutAddr } from '../../lib/utils';

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
        },
        {
          name: 'apy',
          label: 'APY',
        },
        {
          name: 'impermanentLoss',
          label: 'IL',
        },
        {
          name: 'totalEarningsRune',
          label: 'Rewards',
        },
        {
          name: 'totalDepthUsd',
          label: 'Depth',
        },
      ],
    };
  },
  computed: {
    pools() {
      const unsortedPools = Object.keys(this.$store.state.pools.technicalAnalysis).map((poolId) => {
        const period = periodsHistoryMap[this.currentTimeOption];
        const poolPeriodTA = this.$store.state.pools.technicalAnalysis[poolId][period];
        const periodIntervals = Object.keys(poolPeriodTA.intervals).map(i => parseInt(i, 10)).sort();
        // the impermanent loss of the entire period is the last interval IL
        const lastInterval = periodIntervals[periodIntervals.length-1];
        return {
          ...poolPeriodTA,
          poolId,
          impermanentLoss: poolPeriodTA.intervals[lastInterval].impermanentLoss,
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
</style>
