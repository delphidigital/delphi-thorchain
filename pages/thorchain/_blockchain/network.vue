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
      <div class="pure-u-1 pure-u-md-1-2 section--split-left">
        <div class="section">
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
          </div>
          <div class="section__body">
            <DeterministicRunePieChart :chart-data="deterministicRuneData"/>
          </div>

        </div>
      </div>

      <div class="pure-u-1 pure-u-md-1-2 section--split-right">
        <div class="section">
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

export default {
  // load data here
  components: {
    NodesByLocation,
    NodeDetailList,
    DeterministicRunePieChart,
    ChurnInfo,
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
    deterministicRuneData() {
      return [
        {
          name: "Loren Ipsum",
          y: 75,
          color: "#5529a9",
        },
        {
          name: "Loren Ipsum",
          y: 25,
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
</style>
