<template>
  <div class="page__container">
    <div class="page__header">
      <h1 class="page__title">
        Network
      </h1>
      <BlockchainToggle />
    </div>

    <div class="pure-g">
      <div class="pure-u-1-2 pure-u-md-1-4 section--split-left">
        <div class="section network__header__values">
          <h2 class="networksection__title">
            {{ runePriceUSD }}
          </h2>
          <div class="networksection__subtitle">
            Price RUNE
          </div>
        </div>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-4 section--split-left section--split-right">
        <div class="section network__header__values">
          <h2 class="networksection__title">
            {{ formatUsd(marketCapitalization) }}
          </h2>
          <div class="networksection__subtitle">
            Market Cap
          </div>
        </div>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-4 section--split-left section--split-right">
        <div class="section network__header__values">
          <h2 class="networksection__title">
            {{ formatUsd(volume24h) }}
          </h2>
          <div class="networksection__subtitle">
            24h Volume
          </div>
        </div>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-4 section--split-right">
        <div class="section network__header__values">
          <h2 class="networksection__title">
            {{ formatUsd(totalValueLockedUsd) }}
          </h2>
          <div class="networksection__subtitle">
            Total Value Locked
          </div>
        </div>
      </div>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-2 section--split-left" style="display: inline-flex;overflow: overlay;">
        <div class="section" style="flex: 1;">
          <div class="section__header" id="deterministic-rune">
            <h2 class="section__title">
              Deterministic RUNE
            </h2>
            <a class="deeplink-selector" href="#deterministic-rune">
              <Icon
                name="link"
                scale="0.7"
              ></Icon>
            </a>
            <a class="tweet__link" :href="tweetDeterministicRune" target="_blank">
              <Icon
                name="brands/twitter"
                scale="0.7"
              ></Icon>
            </a>
          </div>
          <div class="section__body" style="padding-top: 34px;">
            <DeterministicRunePieChart
              :chart-data="deterministicRuneData"
              :deterministic-rune-price="deterministicRunePrice"
              :speculative-multiplier="speculativeMultiplier"
            />
          </div>

        </div>
      </div>

      <div class="pure-u-1 pure-u-md-1-2 section--split-right" style="display: inline-flex;overflow: overlay;">
        <div class="section" style="flex: 1;">
          <div class="section__header" id="block-rewards-per-day">
            <h2 class="section__title">
              Block Rewards per Day
            </h2>
            <a class="deeplink-selector" href="#block-rewards-per-day">
              <Icon
                name="link"
                scale="0.7"
              ></Icon>
            </a>
            <a class="tweet__link" :href="tweetBlockRewardsPerDay" target="_blank">
              <Icon
                name="brands/twitter"
                scale="0.7"
              ></Icon>
            </a>
          </div>
          <BlockRewardsPerDayColumnChart />
          <hr class="section__divider" />
          <div class="section__footer">
            <div class="section_footer_info">
              <span>Bond Reward / Node:</span>
              <span>{{ formatUsd(monthBondRewardPerNode) }} / Month</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-2-3 section--split-left" style="display: inline-flex;">
        <div class="section" style="flex: 1;">
          <div class="section__header" id="volumebypool_vs_total_volume">
            <h2 class="section__title">
              Volume by pool vs. Total volume
            </h2>
            <div class="volume-by-pool-time-selector">
              <button
                v-for="option in timeOptions"
                :key="option"
                class="volume-by-pool-time-option"
                :class="{ 'volume-by-pool-time-option--active': option === currentTimeOption }"
                @click="togglePeriod(option)"
              >
                {{ option }}
              </button>
            </div>
            <a class="deeplink-selector" href="#volumebypool_vs_total_volume">
              <Icon name="link" scale="0.7"></Icon>
            </a>
            <a class="tweet__link" :href="tweetVolumeByPoolVsTotalVolume" target="_blank">
              <Icon
                name="brands/twitter"
                scale="0.7"
              ></Icon>
            </a>
          </div>
          <VolumeByPoolVsTotalVolume :currentTimeOption="currentTimeOption" />
        </div>
      </div>

      <div class="pure-u-1 pure-u-md-1-3 section--split-right" style="display: inline-flex;">
        <div class="section" style="flex: 1;">
          <div class="section__header" id="activity_levels">
            <h2 class="section__title">
              Activity levels
            </h2>
            <!-- <a class="deeplink-selector" href="#activity_levels">
              <Icon name="link" scale="0.7"></Icon>
            </a> -->
          </div>
          <div class="section__body section__body--list">
            <div class="body__listitem"><span>Total Volume:</span> {{ formatUsd(swapVolume) }}</div>
            <div class="body__listitem"><span>Total Depth:</span> {{ formatUsd(totalDepth) }}</div>
            <div class="body__listitem"><span>Total Earnings:</span> {{ formatUsd(totalEarnings) }}</div>
            <div class="body__listitem"><span># of Swaps:</span> {{ swapCount }}</div>
            <div class="body__listitem"><span>Daily Users:</span> {{ dailyActiveUsers }}</div>
            <div class="body__listitem"><span># of liquidity providers:</span> {{ addLiquidityCount }}</div>
            <div class="body__listitem"><span>Liquidity added:</span> {{ formatUsd(addLiquidityVolume) }}</div>
            <div class="body__listitem"><span>Liquidity withdraw:</span> {{ formatUsd(liquidityWithdraw) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!this.$store.state.thorchain.loading">
      <div class="pure-g">
        <div class="pure-u-1 pure-u-lg-1-3 section--lg-split-left">
          <NodeStatus />
        </div>

        <div class="pure-u-1 pure-u-lg-2-3 section--lg-split-right network-top-right">
          <div class="pure-g">
            <div class="pure-u-1 pure-u-md-5-8 section--split-left">
              <NetworkSecurity />
            </div>
            <div class="pure-u-1 pure-u-md-3-8 section--split-right">
              <NetworkLatestBlocks />
            </div>
          </div>

          <NetworkSolvency />
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-2 section--split-left">
          <ChurnInfo />
        </div>
        <div class="pure-u-1 pure-u-md-1-2 section--split-right">
          <NodesByLocation />
        </div>
      </div>

      <NodeDetailList />

      <Footer />
    </div>
    <div v-else>
      <Loading />
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import frontendFetcher from '../../../lib/frontendFetcher.mjs';
import NodesByLocation from '../../../components/Network/NodesByLocation.vue';
import ChurnInfo from '../../../components/Network/ChurnInfo.vue';
import NodeDetailList from '../../../components/Network/NodeDetailList.vue';
import DeterministicRunePieChart from '../../../components/Network/DeterministicRunePieChart.vue';
import BlockRewardsPerDayColumnChart from '../../../components/Network/BlockRewardsPerDayColumnChart.vue';
import VolumeByPoolVsTotalVolume from '../../../components/Network/VolumeByPoolVsTotalVolume.vue';

const runeDivider = 10 ** 8;

export default {
  // load data here
  components: {
    NodesByLocation,
    NodeDetailList,
    DeterministicRunePieChart,
    BlockRewardsPerDayColumnChart,
    ChurnInfo,
    VolumeByPoolVsTotalVolume,
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = '/thorchain/testnet/network'; // TODO: include mainnet too
    const rewardsPerDayDeepLink = `${baseUrl}${tabBasePath}#block-rewards-per-day`;
    const deterministicRuneDeepLink = `${baseUrl}${tabBasePath}#deterministic-rune`;
    const volumeByPoolVsTotalDeepLink = `${baseUrl}${tabBasePath}#volumebypool_vs_total_volume`;
    return {
      currentTimeOption: '1W',
      timeOptions: ['1W', '1M', '3M', '6M', '1Y'],
      tweetBlockRewardsPerDay: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Block Rewards Per Day')}&url=${encodeURIComponent(rewardsPerDayDeepLink)}`,
      tweetDeterministicRune: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Deterministic RUNE')}&url=${encodeURIComponent(deterministicRuneDeepLink)}`,
      tweetVolumeByPoolVsTotalVolume: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Volume by pool vs. Total volume')}&url=${encodeURIComponent(volumeByPoolVsTotalDeepLink)}`,
    };
  },
  async fetch() {
    await frontendFetcher(this, this.$route.params.blockchain);
    this.$store.commit('thorchain/loadingOff');
  },
  beforeMount() {
    window.addEventListener('focus', this.pollDataActivate);
    window.addEventListener('blur', this.pollDataDeactivate);
  },
  mounted() {
    this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    this.$store.commit('nodeStarred/initializeStore');
  },
  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    window.removeEventListener('focus', this.pollDataActivate);
    window.removeEventListener('blur', this.pollDataDeactivate);
  },
  computed: {
    totalEarnings() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return parseInt(this.$store.state.pools.allPoolsHistoryEarnings.allTimePeriod.meta.earnings || '0', 10) / runeDivider * price;
    },
    swapVolume() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return parseInt(this.$store.state.networkHealth.stats.swapVolume || '0', 10) / runeDivider * price;
    },
    totalDepth() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return parseInt(this.$store.state.networkHealth.stats.runeDepth || '0', 10) / runeDivider * price;
    },
    liquidityWithdraw() {
      // TODO: FIX THIS
      // withdrawVolume should return a value that requires runeDivider but the api has a bug
      return parseInt(this.$store.state.networkHealth?.stats?.withdrawVolume || '0', 10);
    },
    addLiquidityVolume() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return parseInt(this.$store.state.networkHealth?.stats?.addLiquidityVolume || '0', 10) / runeDivider * price;
    },
    addLiquidityCount() {
      return parseFloat(this.$store.state.networkHealth?.stats?.addLiquidityCount) || 0;
    },
    swapCount() {
      return parseFloat(this.$store.state.networkHealth?.stats?.swapCount) || 0;
    },
    dailyActiveUsers() {
      return parseFloat(this.$store.state.networkHealth.stats.dailyActiveUsers) || 0;
    },
    monthBondRewardPerNode() {
      const monthBondingEarnings = parseInt(this.$store.state.pools.allPoolsHistoryEarnings?.period1M?.meta?.bondingEarnings || '0', 10);
      const monthAvgNodeCount = parseFloat(this.$store.state.pools.allPoolsHistoryEarnings?.period1M?.meta?.avgNodeCount || '0.0');
      const monthBondRewardPerNode = ((monthBondingEarnings / (10**8)) / monthAvgNodeCount);
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return monthBondRewardPerNode * price;
    },
    deterministicRunePrice() {
      // The deterministic Rune Price chart is a hisorical chart of the deterministic price. Formula: 
      // Deterministic Price = 3 * non-RUNE assets pooled / circulating supply
      const nonRuneDepthsPooled = this.$store.state.pools.poolsOverview.reduce((acc, next) => (
        acc + (parseInt(next.runeDepth, 0) / runeDivider) // rune depth value is = to assetDepth value
      ), 0);
      const cirqSupply = this.$store.state.runeMarketData && this.$store.state.runeMarketData.circulatingSupply || 0;
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      let deterministicRunePrice = 0;
      if (nonRuneDepthsPooled && cirqSupply && price) {
        deterministicRunePrice = ((3 * nonRuneDepthsPooled) / cirqSupply) * price;
      }
      return deterministicRunePrice;
    },
    speculativeMultiplier() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const detPrice = this.deterministicRunePrice;
      return price && detPrice ? (price / detPrice) : 0;
    },
    deterministicRuneData() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return [
        {
          name: "Actual price",
          y: price,
          color: "#5529a9",
        },
        {
          name: "Deterministic price",
          y: this.deterministicRunePrice,
          color: "#2d99fe",
        },
      ];
    },
    runePriceUSD() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return numeral(price).format('($0,0.00a)').toUpperCase();
    },
    marketCapitalization() {
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const supply = this.$store.state.runeMarketData && this.$store.state.runeMarketData.circulatingSupply || 0;
      return price * supply;
    },
    volume24h() {
      const totalRuneVol24h = (
        this.$store.state.pools.poolsOverview.reduce((p, n) => (p + parseInt(n.volume24h, 10)), 0)
        / 10 ** 8
      );
      const priceUsd = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return totalRuneVol24h * priceUsd;
    },
    totalValueLockedUsd() {
      return this.$store.state.runeMarketData.totalValueLockedUSD || 0;
    }
  },
  methods: {
    togglePeriod(period) {
      if (this.currentTimeOption !== period) {
        this.currentTimeOption = period;
      }
    },
    formatUsd(n) {
      return numeral(n).format('($0,0)').toUpperCase();
    },
    async pollData() {
      await this.$fetch();
      this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
    },
    pollDataActivate() {
      if (!this.timeout) {
        this.timeout = setTimeout(this.pollData, process.env.pollingFrequency);
      }
    },
    pollDataDeactivate() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.network-top-right {
  display: flex;
  flex-direction: column;
}
.network__header__values {
  padding: 25px;
  text-align: center;
  .networksection__title {
    text-align: center;
    display: block;
    font-weight: 800;
    font-size: 23px;
  }
  .networksection__subtitle {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 600;
    opacity: 0.75;
  }
}
.section__body--list {
  > .body__listitem {
    display: flex;
    padding: 18px 24px;
    font-size: 15px;
    font-weight: 500;
    opacity: 0.8;
    border-bottom: 2px solid rgba(150,150,150,0.3);
    > span:first-child {
      flex: 1;
    }
    &:last-child {
      border-bottom: none;
    }
  }
}
.section__footer {
  margin-top: 12px;
}
.section_footer_info {
  display: flex;
  flex-direction: row;
  font-size: 15px;
  font-weight: 500;
  margin: 26px 26px 0 26px;
  padding-bottom: 26px;

  > span:first-child {
    display: inline-flex;
    flex: 1;
  }
}

.volume-by-pool-time-selector {
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

.volume-by-pool-time-option {
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

.volume-by-pool-time-option--active {
  color: #fff;
}

</style>
