<template>
  <div class="page__container">
    <div class="section-disclamer">
      This product is in open beta, don't make decisions based on the information displayed on this dashboard.
      The accuracy of displayed information is still being validated. 
      Please forward any feedback to @bitcoin_sage on twitter.
    </div>
    <div class="page__header">
      <h1 class="page__title">
        Network
      </h1>
      <BlockchainToggle />
    </div>
    <div v-if="!this.$store.state.thorchain.loading">
      <div class="pure-g">
        <div class="pure-u-1-2 pure-u-md-1-5 section--split-left">
          <div class="section network__header__values">
            <h2 class="networksection__title">
              {{ runePriceUSD }}
            </h2>
            <div class="networksection__subtitle">
              Price RUNE
            </div>
          </div>
        </div>
        <div class="pure-u-1-2 pure-u-md-1-5 section--split-left section--split-right">
          <div class="section network__header__values">
            <h2 class="networksection__title">
              {{ formatUsd(marketCapitalization) }}
            </h2>
            <div class="networksection__subtitle">
              Market Cap
            </div>
          </div>
        </div>
        <div class="pure-u-1-2 pure-u-md-1-5 section--split-left section--split-right">
          <div class="section network__header__values">
            <h2 class="networksection__title">
              {{ formatUsd(volume24h) }}
            </h2>
            <div class="networksection__subtitle">
              24h Volume
            </div>
          </div>
        </div>
        <div class="pure-u-1-2 pure-u-md-1-5 section--split-right">
          <div class="section network__header__values">
            <h2 class="networksection__title">
              {{ formatUsd(totalValueLockedUsd) }}
            </h2>
            <div class="networksection__subtitle">
              Total Value Locked
            </div>
          </div>
        </div>
        <div class="pure-u-1-2 pure-u-md-1-5 section--split-right">
          <div class="section network__header__values">
            <h2 class="networksection__title" :style="`color: ${queueStatus[1]}`">
              {{ queueStatus[0] }}

            <span class="section__title--tooltip section__title--tooltip--bottom">
              <Icon
                class="tooltip__hover--info"
                name="info"
                scale="0.4"
              >
              </Icon>
              <div class="app-tooltip section__title__tooltip">
                <div class="app-tooltip__body">
                  Normal: No delays expected<br />
                  Busy: Expect delayed transactions <br />
                  Congested: Expect severely delayed transactions.
                </div>
              </div>
            </span>


            </h2>
            <div class="networksection__subtitle">
              Thorchain Queue Status
            </div>
          </div>
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-2-3 section--split-left">
          <div class="section" style="flex: 1;">
            <div class="section__header" id="volumebypool_vs_total_volume">
              <h2 class="section__title display--notmobile">
                Volume by pool vs. Total volume
              </h2>
              <div class="section__title__actions">
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
              <a class="deeplink-selector" href="#activity_levels">
                <Icon name="link" scale="0.7"></Icon>
              </a>
              <a class="tweet__link" :href="tweetActivityLevels" target="_blank">
                <Icon
                  name="brands/twitter"
                  scale="0.7"
                ></Icon>
              </a>
            </div>
            <div class="section__body section__body--list">
              <div class="body__listitem"><span>Total Volume:</span> {{ formatUsd(swapVolume) }}</div>
              <div class="body__listitem"><span>Total Depth:</span> {{ formatUsd(totalDepth) }}</div>
              <div class="body__listitem"><span>Total Earnings:</span> {{ formatUsd(totalEarnings) }}</div>
              <div class="body__listitem"><span>Total # of swaps:</span> {{ swapCount }}</div>
              <div class="body__listitem"><span>Daily Users:</span> {{ dailyActiveUsers }}</div>
              <div class="body__listitem"><span># of liquidity providers:</span> {{ addLiquidityCount }}</div>
              <div class="body__listitem"><span>Liquidity added:</span> {{ formatUsd(addLiquidityVolume) }}</div>
              <div class="body__listitem"><span>Liquidity withdrawn:</span> {{ formatUsd(liquidityWithdraw) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1 pure-u-md-1-2 section--split-left">
          
          <div class="section" style="flex: 1;">
            <div class="section__header" id="deterministic-rune" style="overflow-x: visible;">
              <h2 class="section__title">
                Deterministic RUNE

                <span class="section__title--tooltip">
                  <Icon
                    class="tooltip__hover--info"
                    name="info"
                    scale="0.4"
                  >
                  </Icon>
                  <div class="app-tooltip section__title__tooltip">
                    <div class="app-tooltip__body">
                      The deterministic price of RUNE is the minimum expected value of RUNE, given the current total value locked on Thorchain. A speculative multiplier is expected.
                    </div>
                  </div>
                </span>
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
            <div class="section__body" style="padding-top: 16px;padding-bottom: 16px;">
              <DeterministicRunePieChart
                :chart-data="deterministicRuneData"
                :deterministic-rune-price="deterministicRunePrice"
                :speculative-multiplier="speculativeMultiplier"
              />
            </div>
          </div>
          <NetworkSolvency />
        </div>

        <div class="pure-u-1 pure-u-md-1-2 section--split-right">
          <div class="section" style="flex: 1;">
            <div class="section__header" id="block-rewards-per-day" style="overflow-x: visible;">
              <h2 class="section__title">
                Earnings per Day
                <span class="section__title--tooltip">
                  <Icon
                    class="tooltip__hover--info"
                    name="info"
                    scale="0.4"
                  >
                  </Icon>
                  <div class="app-tooltip section__title__tooltip">
                    <div class="app-tooltip__body">
                      An overview of the reward the network pays out to the liquidity pools and nodes. Bond Reward/Node: The amount an average Thornode earns per month.
                    </div>
                  </div>
                </span>
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
            <div class="block-rewards-perday-section">
              <BlockRewardsPerDayColumnChart />
              <hr class="section__divider" />
              <div class="section__footer" style="display: flex;flex: 1;margin-top:0;">
                <div class="section_footer_info">
                  <span>Bond Reward / Node:</span>
                  <span>{{ formatUsd(monthBondRewardPerNode) }} / Month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pure-g">
        <div class="pure-u-1">
          <div class="section" style="flex: 1;">
            <div class="section__header" id="rune_location" style="overflow-x: visible;">
              <h2 class="section__title">
                Location of RUNE
                <span class="section__title--tooltip">
                  <Icon
                    class="tooltip__hover--info"
                    name="info"
                    scale="0.4"
                  >
                  </Icon>
                  <div class="app-tooltip section__title__tooltip" style="width:340px;">
                    <div class="app-tooltip__body">
                      An overview of where all RUNE is located:<br />
                      Pooled: The amount of RUNE in liquidity pools on Thorchain<br />
                      Standby Bonded: The amount of RUNE bonded by standby nodes.<br />
                      Active Bonded: The amount of RUNE bonded by active nodes.<br />
                      Reserve: The amount of RUNE in the reserve.<br />
                      Unreleased: The amount of unreleased RUNE. This portion will be released in line with the emission schedule.<br />
                      Unlocked: The amount of RUNE elsewhere.<br />
                    </div>
                  </div>
                </span>
              </h2>
              <a class="deeplink-selector" href="#rune_location">
                <Icon name="link" scale="0.7"></Icon>
              </a>
              <a class="tweet__link" :href="tweetRuneLocation" target="_blank">
                <Icon
                  name="brands/twitter"
                  scale="0.7"
                ></Icon>
              </a>
            </div>
            <div class="section__body">
              <div class="location-rune-detail">
                <div class="perc-rune-locked">
                  <h3>
                    {{percentageOfRuneLocked}} %
                  </h3>
                  <div>% of RUNE locked</div>
                </div>
                <div class="cirq-supply-rune">
                  <CirculatingSupply />
                </div>
              </div>
              <div class="location-of-rune-section">
                <LocationOfRune />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TODO: ENABLE Thorchain Developer Activity when ready
      <div class="pure-g">
        <div class="pure-u-1">
          <div class="section" style="flex: 1;">
            <div class="section__header" id="thorchain_dev_activity">
              <h2 class="section__title">
                Thorchain Developer Activity
              </h2>
              <a class="deeplink-selector" href="#thorchain_dev_activity">
                <Icon name="link" scale="0.7"></Icon>
              </a>
              <a class="tweet__link" :href="tweetThorchainDevActivity" target="_blank">
                <Icon
                  name="brands/twitter"
                  scale="0.7"
                ></Icon>
              </a>
            </div>
            <div class="section__body dev-activity-section">
              <div class="dev-activity-detail">
                <div class="dev-detail-numberdevs">
                  <h3>16</h3>
                  <div># of active developers</div>
                </div>
                <div class="dev-detail-devretention">
                  <h3>25%</h3>
                  <div>Developer retention</div>
                </div>
              </div>
              <div class="dev-activity-chart">
                <div class="dev-activity-chartwrapper">
                  <div class="dev-activity-header">
                    <div class="dev-activity-header-title">Gitlab commits over time</div>
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
                  </div>
                  <div class="dev-activity-gitlabchart">
                    <GitlabCommitsChart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      -->
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
import DeterministicRunePieChart from '../../../components/Network/DeterministicRunePieChart.vue';
import BlockRewardsPerDayColumnChart from '../../../components/Network/BlockRewardsPerDayColumnChart.vue';
import VolumeByPoolVsTotalVolume from '../../../components/Network/VolumeByPoolVsTotalVolume.vue';
import LocationOfRune from '../../../components/Network/LocationOfRune.vue';
import GitlabCommitsChart from '../../../components/Network/GitlabCommitsChart.vue';
import CirculatingSupply from '../../../components/Network/CirculatingSupply.vue';
const runeDivider = 10 ** 8;

export default {
  // load data here
  components: {
    DeterministicRunePieChart,
    BlockRewardsPerDayColumnChart,
    VolumeByPoolVsTotalVolume,
    LocationOfRune,
    GitlabCommitsChart,
    CirculatingSupply
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const rewardsPerDayDeepLink = `${baseUrl}${tabBasePath}#block-rewards-per-day`;
    const deterministicRuneDeepLink = `${baseUrl}${tabBasePath}#deterministic-rune`;
    const volumeByPoolVsTotalDeepLink = `${baseUrl}${tabBasePath}#volumebypool_vs_total_volume`;
    const activityLevelsDeepLink = `${baseUrl}${tabBasePath}#activity_levels`;
    const runeLocationDeepLink = `${baseUrl}${tabBasePath}#rune_location`;
    const thorchainDevActivityDeepLink = `${baseUrl}${tabBasePath}#thorchain_dev_activity`;
    return {
      currentTimeOption: '1D',
      timeOptions: ['1D', '1W', '1M'],
      tweetBlockRewardsPerDay: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Block Rewards Per Day')}&url=${encodeURIComponent(rewardsPerDayDeepLink)}`,
      tweetDeterministicRune: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Deterministic RUNE')}&url=${encodeURIComponent(deterministicRuneDeepLink)}`,
      tweetVolumeByPoolVsTotalVolume: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Volume by pool vs. Total volume')}&url=${encodeURIComponent(volumeByPoolVsTotalDeepLink)}`,
      tweetActivityLevels: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Activity levels')}&url=${encodeURIComponent(activityLevelsDeepLink)}`,
      tweetRuneLocation: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Location of RUNE')}&url=${encodeURIComponent(runeLocationDeepLink)}`,
      tweetThorchainDevActivity: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Thorchain Developer Activity')}&url=${encodeURIComponent(thorchainDevActivityDeepLink)}`,
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
    percentageOfRuneLocked() {
      // TODO: use total supply api when available
      const coingecko = this.$store.state.runeMarketData.coingeckoMarketData;
      // const pooledPlusBonded = this.$store.state.runeMarketData.circulatingSupply;
      // // rune locked is all rune in pools + bonded + in reserve
      // const cirqSupply = (
      //   this.$store.state.runeMarketData && this.$store.state.runeMarketData.circulatingSupply || 0
      // );
      // const totalSupply = coingeckoMarketData.total_supply;
      // const circulatingSupply = ;
        // ? pooledPlusBonded
        // : coingecko.circulating_supply;
      const supplyLocked = (
        (this.$store.state.networkHealth.network.bondMetrics.totalActiveBond/10**8) +
        (this.$store.state.networkHealth.network.totalPooledRune/10**8) + 
        (this.$store.state.networkHealth.network.totalReserve/10**8)
      );
      const percentOfSupplyLocked = (
        (supplyLocked * 100) / coingecko.circulating_supply
      );
      return percentOfSupplyLocked.toFixed(2);
    },
    queueStatus() {
      const queue = this.$store.state.networkHealth && this.$store.state.networkHealth.queue || {};
      const totalInQueue = parseInt(queue.swap || "0", 10) + parseInt(queue.outbound || "0", 10);
      let status = ["Normal", "#19ceb8"];
      if (totalInQueue > 500) {
        status = ["Busy", "#ceb819"];
      } else if (totalInQueue > 100) {
        status = ["Congested", "#ee4839"];
      }
      return status;
    },
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
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return parseInt(this.$store.state.networkHealth?.stats?.withdrawVolume || '0', 10) / runeDivider * price;
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
      const monthBondingEarnings = parseInt(this.$store.state.pools.allPoolsHistoryEarnings?.period1HM?.meta?.bondingEarnings || '0', 10);
      const monthAvgNodeCount = parseFloat(this.$store.state.pools.allPoolsHistoryEarnings?.period1HM?.meta?.avgNodeCount || '0.0');
      const monthBondRewardPerNode = ((monthBondingEarnings / (10**8)) / monthAvgNodeCount);
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      return monthBondRewardPerNode * price;
    },
    deterministicRunePrice() {
      const v1SinglechainTotalDepth = this.$store.state.networkHealth.v1SinglechainStats?.totalDepth || 0;
      // pooling is 50% rune value and 50% asset, so non rune assets value is 1/2 of totalDepth
      const v1SinglechainNonRuneDepth = v1SinglechainTotalDepth ? ((parseInt(v1SinglechainTotalDepth, 10)/runeDivider)/2) : 0;
      // The deterministic Rune Price chart is a hisorical chart of the deterministic price. Formula: 
      // Deterministic Price = 3 * non-RUNE assets pooled / circulating supply
      const nonRuneDepthsPooled = this.$store.state.pools.poolsOverview.reduce((acc, next) => (
        acc + (parseInt(next.runeDepth, 0) / runeDivider) // rune depth value is = to assetDepth value
      ), 0) + v1SinglechainNonRuneDepth;
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
      // TODO: Review this again
      // When deterministic price is the same as the current price the circle should be filled with the deterministic multiplier.
      // When deterministic price is 1/2 of the current price it should fill half.
      const price = this.$store.state.runeMarketData && this.$store.state.runeMarketData.priceUSD || 0;
      const detRuneProportion = this.deterministicRunePrice * 100 / price;
      return [
        {
          name: "Actual price",
          y: 100 - detRuneProportion,
          color: "#5529a9",
          label: price,
        },
        {
          name: "Deterministic price",
          y: detRuneProportion,
          color: "#2d99fe",
          label: this.deterministicRunePrice,
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
.network__header__values {
  padding: 29px 24px;
  text-align: center;
  .networksection__title {
    text-align: center;
    display: block;
    font-weight: 600;
    font-size: 21px;
  }
  .networksection__subtitle {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    opacity: 0.75;

    @media screen and (max-width: $pureg-lg) {
      font-size: 12px;
    }
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
  flex: 1;
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
  @media screen and (max-width: $pureg-lg) {
    height: 30px; margin-left: 10px; padding: 0 8px; margin-right: 10px;
  }
}

.section__title__actions {
  display: flex;
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
.location-of-rune-section, .block-rewards-perday-section {
  @media screen and (max-width: $pureg-lg) {
    overflow-x: scroll;
  }
}
.location-rune-detail {
  display: flex;
  margin: 22px;
  > div {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid #3f4456;
    padding: 14px 20px;
    border-radius: 8px;

    &:first-child {
      margin-right: 12px;
    }
    &:last-child {
      margin-left: 12px;
    }
  }
  .perc-rune-locked {
    align-items: center;
    justify-content: center;
    h3 {
      margin: 8px;
      font-size: 22px;
      color: white;
    }
    div {
      font-size: 14px;
      color: #a5a8b1;
      font-weight: 500;
      margin-bottom: 8px;
    }
  }
  .cirq-supply-rune {
    .cirq-supply-runetitle {
      font-size: 14px;
      font-weight: 700;
      color: white;
    }
  }
}
.dev-activity-section {
  display: flex;
  flex-direction: row;
  .dev-activity-detail {
      display: flex;
      margin: 22px;
      flex-direction: column;
      max-width: 270px;
      min-width: 250px;

    .dev-detail-numberdevs, .dev-detail-devretention {
      display: flex;
      flex-direction: column;
      flex: 1;
      background-color: #262f4a;
      padding: 32px 28px;
      border-radius: 8px;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      h3 {
        margin: 8px;
        font-size: 22px;
        color: white;
      }
      div {
        font-size: 14px;
        color: #a5a8b1;
        font-weight: 500;
        margin-bottom: 8px;
      }
    }
  }
  .dev-activity-chart {
    display: flex;
    flex: 1;
    .dev-activity-chartwrapper {
      margin: 28px;
      display: flex;
      flex: 1;
      flex-direction: column;
      border: 1px solid #3f4456;
      padding: 14px 0px;
      border-radius: 8px;
      .dev-activity-header {
        flex-direction: row;
        display: flex;
        margin: 0;
        padding: 0 20px 10px 20px;
        border-bottom: 1px solid #3f4456;
        > .dev-activity-header-title {
          display: flex;
          flex: 1;
          font-size: 14px;
          font-weight: 700;
          color: white;
        }
      }
      .dev-activity-gitlabchart {
        margin: 20px;
      }
    }
    
  }
}

#volumebypool_vs_total_volume {
  @media screen and (max-width: 500px) {
    flex-direction: column;
    border-bottom: none;
    > h2 {
      margin-top: 16px;
      margin-bottom: 16px;
    }
  }
}
</style>
