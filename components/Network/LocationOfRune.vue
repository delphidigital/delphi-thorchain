<template>
  <div class="location-squarebox-wrapper">
    <div
      v-for="item in dataProportions"
      :key="item['name']"
      class="location-squarebox-lvl1"
    >
      <div :style="getItemCssProps(item, 1)">
        <div class="squarebox-label">{{ displayName(item) }}</div>
        <div v-if="item.child">
          <div
            class="location-squarebox-inner"
            :style="getItemCssProps(item.child, 2)"
          >
            <div class="squarebox-label">{{ displayName(item.child) }}</div>
            <div v-if="item.child.child">
              <div
                class="location-squarebox-inner"
                :style="getItemCssProps(item.child.child, 3)"
              >
                <div class="squarebox-label">{{ displayName(item.child.child) }}</div>

                <div v-if="item.child.child.child">
                  <div
                    class="location-squarebox-inner"
                    :style="getItemCssProps(item.child.child.child, 4)"
                  >
                    <div class="squarebox-label">{{ displayName(item.child.child.child) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import getProportions from "../../plugins/customSquareChartUtil";
export default {
  methods: {
    getItemCssProps(item, level) {
      let css = `width: ${item.width}px; height:${item.height}px; background-color: ${item.color};`;
      if (item.value < 100) {
        css += ` color: ${item.color};`;
      }
      if (level === 1 && item.value < 120) {
        css += `writing-mode: vertical-rl;text-orientation: upright;text-align: start;`;
      }
      return css;
    },
    displayName(item) {
      if (item.value < 100) {
        return '';
      }
      return item.name;
    },
    logScale(value) {
      const totalSupply = this.$store.state.runeMarketData.coingeckoMarketData.total_supply;
      var minp = 1;
      var maxp = totalSupply;
      // The result should be between 100 an 10000000
      var minv = Math.log(100);
      var maxv = Math.log(100000);
      // calculate adjustment factor
      var scale = (maxv-minv) / (maxp-minp);
      const ret = Math.exp(minv + scale*(value-minp));
      return ret;
    },
  },
  data() {
    const coingeckoMarketData = this.$store.state.runeMarketData.coingeckoMarketData;
    // TODO: use actual testnet circulating supply for now uses coingecko mainnet data
    const totalSupply = coingeckoMarketData.total_supply;
    const circulatingSupply = coingeckoMarketData.circulating_supply;
    const net = this.$store.state.networkHealth.network;
    const bm = net.bondMetrics;
    const supActiveBonded =
      bm.totalActiveBond && bm.totalActiveBond !== "0"
        ? parseInt(bm.totalActiveBond, 10) / 10 ** 8
        : 0;
    const supSandbyBonded =
      bm.totalStandbyBond && bm.totalStandbyBond !== "0"
        ? parseInt(bm.totalStandbyBond, 10) / 10 ** 8
        : 0;
    const totalBonded = supActiveBonded + supSandbyBonded;
    const supPooled =
      net.totalPooledRune && net.totalPooledRune !== "0"
        ? parseInt(net.totalPooledRune, 10) / 10 ** 8
        : 0;
    const supUnlocked = circulatingSupply - (totalBonded + supPooled);
    const supUnreleased = totalSupply - circulatingSupply;
    const supReserve =
      net.totalReserve && net.totalReserve !== "0"
        ? parseInt(net.totalReserve, 10) / 10 ** 8
        : 0;

    return {
      chartData: [
        {
          name: "Unlocked",
          value: this.logScale(supUnlocked),
          color: "#3f4456",
          child: {
            name: "Active Bonded",
            value: this.logScale(supActiveBonded),
            color: "#2d99fe",
            child: {
              name: "Standby Bonded",
              value: this.logScale(supSandbyBonded),
              color: "#5e2bbc",
              child: {
                name: "Pooled",
                value: 3,
                color: "#f8c950",
              },
            },
          },
        },
        {
          name: "Reserve",
          value: this.logScale(supReserve),
          color: "#19ceb8",
        },
        {
          name: "Unreleased",
          value: this.logScale(supUnreleased),
          color: "#4346d3",
        },
      ],
    };
  },
  computed: {
    dataProportions() {
      return getProportions(this.chartData, 1000, 300);
    },
  },
};
</script>

<style>
.chart-placeholder {
  height: 320px;
}
.location-squarebox-wrapper {
  position: relative;
  clear: both;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-bottom: 28px;
  user-select: none;
}
.location-squarebox-lvl1 {
  position: relative;
  color: white;
  text-align:center;
}
.location-squarebox-inner {
  position: absolute;
  bottom: 0;
  right: 0;
}
.squarebox-label {
  font-size: 11px;
  padding-top: 20px;
}
.location-squarebox-inner > .squarebox-label {
  font-size: 10px;
  padding-top: 10px;
}
.location-squarebox-inner > div > .location-squarebox-inner > .squarebox-label {
  font-size: 9px;
  padding-top: 5px;
}
.location-squarebox-inner > div > .location-squarebox-inner > div > .location-squarebox-inner > .squarebox-label {
  font-size: 8px;
  padding-top: 2px; 
}
</style>
