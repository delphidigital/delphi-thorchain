<template>
  <div class="section">
    <div class="section__header standby-pools-header" id="staged-pools">
      <h2 class="section__title">
        Staged Pools
      </h2>
      <no-ssr>
        <span style="font-size: 11px;display: inline-flex;flex: 1;">
          <VueCountdown :time="secondsToNextPoolActivation * 1000" v-slot="{ days, hours, minutes }" :interval="60000">
            <span style="font-weight: 600; color: #19ceb8;">
              {{days}}d {{hours}}h {{minutes}}m
            </span>
            until next pool activation
          </VueCountdown>
        </span>
      </no-ssr>
      <a class="deeplink-selector" href="#staged-pools">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
      <a class="tweet__link" :href="tweetStandbyPools" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
    </div>
    <div class="section__body">
      <table class="section__table standby-pools-table">
        <thead>
          <tr>
            <th class="section__table__head">
              Name
            </th>
            <th class="section__table__head">
              Price
            </th>
            <th class="section__table__head section__table__head--right">
              Depth
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pool in pools" :key="pool.name" class="section__table__row">
            <td class="section__table__data section__table__data--highlight">
              {{ pool.name }}
            </td>
            <td class="section__table__data">
              {{ formatUsdValue(pool.assetPriceUSD) }}
            </td>
            <td class="section__table__data section__table__data--right">
              {{ formatDepthUsdValue(pool.depth) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import VueCountdown from '@chenfengyuan/vue-countdown';
import numeral from 'numeral';
import { poolNameWithoutAddr } from '../../lib/utils';

export default {
  components: {
    VueCountdown,
  },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const standbyPoolsDeepLink = `${baseUrl}${tabBasePath}#staged-pools`;
    // status enum: "available" "staged" "suspended"
    // Ref: https://testnet.midgard.thorchain.info/v2/doc#operation/GetPools
    const stagedPools = this.$store.state.pools.poolsOverview.filter(p => p.status === 'staged');
    return {
      tweetStandbyPools: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Staged Pools')}&url=${encodeURIComponent(standbyPoolsDeepLink)}`,
      pools: stagedPools.map(p => ({
        name: poolNameWithoutAddr(p.asset),
        depth: ((parseInt(p.assetDepth, 10)/ (10**8)) * parseFloat(p.assetPriceUSD) * 2),
        assetPriceUSD: parseFloat(p.assetPriceUSD),
      })).sort((a,b) => parseInt(b.depth, 10) - parseInt(a.depth, 10)),
    };
  },
  computed: {
    secondsToNextPoolActivation() {
      const secondsForEachBlock = 5.9;
      return this.$store.state.networkHealth.network.poolActivationCountdown * secondsForEachBlock;
    },
  },
  methods: {
    formatDepthUsdValue(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('($0,0.0)')}K`;
    },
    formatUsdValue(value) {
      return `${numeral(value).format('($0,0.0)')}`;
    },
  }
};
</script>
<style lang="scss" scoped>
.standby-pools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.standby-pools-table {
  width: 100%;
}

.standby-pools-gauge {
  max-width: 160px;
  width: 45%;
  background-color: #2e3a59;
  height: 5px;
  border-radius: 3px;
}

.standby-pools-gauge__primary {
  height: 5px;
  border-radius: 3px;
  background-color: $color-green;
}
.coming-soon__parent {
  height: 100%;
}
</style>
