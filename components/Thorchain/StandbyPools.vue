<template>
  <div class="section">
    <div class="section__header standby-pools-header" id="standby-pools">
      <h2 class="section__title">
        Standby Pools
      </h2>

      <a class="deeplink-selector" href="#standby-pools">
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
      <!--
      <div class="standby-pools-gauge">
        <div
          class="standby-pools-gauge__primary"
          :style="{ width: (nextChurnHeightProgress * 100) + '%' }"
        />
      </div>
      -->
    </div>
    <div class="section__body">
      <table class="section__table standby-pools-table">
        <thead>
          <tr>
            <th class="section__table__head">
              Name
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
            <td class="section__table__data section__table__data--right">
              {{ pool.depth }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import { poolNameWithoutAddr } from '../../lib/utils';

export default {
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const standbyPoolsDeepLink = `${baseUrl}${tabBasePath}#standby-pools`;
    // status enum: "available" "staged" "suspended"
    // Ref: https://testnet.midgard.thorchain.info/v2/doc#operation/GetPools
    const stagedPools = this.$store.state.pools.pools.filter(p => p.poolStats.periodALL.status === 'staged');
    // const ta = this.$store.state.pools.technicalAnalysis;
    return {
      tweetStandbyPools: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Standby Pools')}&url=${encodeURIComponent(standbyPoolsDeepLink)}`,
      pools: stagedPools.map(p => ({
        name: poolNameWithoutAddr(p.poolStats.periodALL.asset),
        depth: this.formatDepthUsdValue(
          (parseInt(p.poolStats.periodALL.assetDepth, 10) * parseFloat(p.poolStats.periodALL.assetPriceUSD) / 10**8) * 2
        ),
      })),
      // nextChurnHeightProgress: Math.random(),
    };
  },
  methods: {
    formatDepthUsdValue(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('($0,0)').replace(',','.')}K`;
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
