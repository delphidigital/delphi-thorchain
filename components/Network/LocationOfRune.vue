<template>
  <div>
  <div class="location-squarebox-wrapper">
    <div
      v-for="item in dataProportions"
      :key="item['name']"
      class="location-squarebox-lvl1"
    >
      <div :style="getItemCssProps(item, 1)" class="squarebox-container">
        
        <div class="squarebox-label"
          @mouseover="hoveringId = item.name"
          @mouseout="hoveringId = null"
          :class="{ 'squarebox-label--hover': hoveringId == item.name}"
        >
          <!-- {{ displayName(item) }}<br/>
          {{ (item.value * 100 / totalSupply).toFixed(2) }}% -->

          <div class="app-tooltip">
            <div class="app-tooltip__header">
              <span class="app-tooltip__marker"></span>
              <span>{{ item.name }}</span>
            </div>
            <div class="app-tooltip__body">
              <p class="app-tooltip__text">
                {{formatValueLabel(item.value)}}
              </p>
            </div>
          </div>

        </div>

        <div v-if="item.child">
          <div
            class="location-squarebox-inner"
            :style="getItemCssProps(item.child, 2)"
          >
            <div class="squarebox-label"
              @mouseover="hoveringId = item.child.name"
              @mouseout="hoveringId = null"
              :class="{ 'squarebox-label--hover': hoveringId == item.child.name}"
            >
              <!-- {{ displayName(item.child) }}<br/>
              {{ (item.child.value * 100 / totalSupply).toFixed(2) }}% -->

              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span class="app-tooltip__marker"></span>
                  <span>{{ item.child.name }}</span>
                </div>
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text">
                    {{formatValueLabel(item.child.value)}}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="item.child.child">
              <div
                class="location-squarebox-inner"
                :style="getItemCssProps(item.child.child, 3)"
              >
                <div class="squarebox-label"
                  @mouseover="hoveringId = item.child.child.name"
                  @mouseout="hoveringId = null"
                  :class="{ 'squarebox-label--hover': hoveringId == item.child.child.name}"
                >
                  <!-- {{ displayName(item.child.child) }}<br/>
                  {{ (item.child.child.value * 100 / totalSupply).toFixed(2) }}% -->
                  <div class="app-tooltip">
                    <div class="app-tooltip__header">
                      <span class="app-tooltip__marker"></span>
                      <span>{{ item.child.child.name }}</span>
                    </div>
                    <div class="app-tooltip__body">
                      <p class="app-tooltip__text">
                        {{formatValueLabel(item.child.child.value)}}
                      </p>
                    </div>
                  </div>
                </div>

                <div v-if="item.child.child.child">
                  <div
                    class="location-squarebox-inner"
                    :style="getItemCssProps(item.child.child.child, 4)"
                  >
                    <div class="squarebox-label"
                      @mouseover="hoveringId = item.child.child.child.name"
                      @mouseout="hoveringId = null"
                      :class="{ 'squarebox-label--hover': hoveringId == item.child.child.child.name}"
                    >
                      <!-- {{ displayName(item.child.child.child) }}<br/>
                      {{ (item.child.child.child.value * 100 / totalSupply).toFixed(2) }}% -->
                      <div class="app-tooltip">
                        <div class="app-tooltip__header">
                          <span class="app-tooltip__marker"></span>
                          <span>{{ item.child.child.child.name }}</span>
                        </div>
                        <div class="app-tooltip__body">
                          <p class="app-tooltip__text">
                            {{formatValueLabel(item.child.child.child.value)}}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="location-legend">
    <div>
      <span class="location-legendcolor location-legendcolor--unlocked">&nbsp;</span><span>Unlocked</span>
    </div>
    <div>
      <span class="location-legendcolor location-legendcolor--activebonded">&nbsp;</span><span>Active Bonded</span>
    </div>
    <div>
      <span class="location-legendcolor location-legendcolor--standbybonded">&nbsp;</span><span>Standby Bonded</span>
    </div>
    <div>
      <span class="location-legendcolor location-legendcolor--pooled">&nbsp;</span><span>Pooled</span>
    </div>
    <div>
      <span class="location-legendcolor location-legendcolor--reserve">&nbsp;</span><span>Reserve</span>
    </div>
    <div>
      <span class="location-legendcolor location-legendcolor--unreleased">&nbsp;</span><span>Unreleased</span>
    </div>
  </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import getProportions from "../../plugins/customSquareChartUtil";

export default {
  methods: {
    formatValueLabel(value) {
      // const thousandsConvert = value / 1000;
      return `${numeral(value).format('(0,0a)').replace(',','.').toUpperCase()}`;
    },
    getItemCssProps(item, level) {
      let css = `width: ${item.width}px; height:${item.height}px; background-color: ${item.color};`;
      const logValue = this.logScale(item.value);
      if (logValue < 100) {
        css += ` color: ${item.color};`;
      }
      if (level === 1 && logValue < 120) {
        css += `writing-mode: vertical-rl;text-orientation: upright;text-align: start;`;
      }
      return css;
    },
    displayName(item) {
      if (item.width < 70 || item.height < 40) {
        return '';
      }
      if (item.child) {
        const realWidth = item.width - item.child.width;
        const realHeight = item.height - item.child.height;
        if (realWidth < 60 || realHeight < 40) {
          return '';
        }
      }
      return item.name;
      // const logValue = this.logScale(item.value);
      // return (logValue < 100) ? '' : item.name;
    },
    logScale(value) {
      const totalSupply = this.$store.state.runeMarketData.coingeckoMarketData.total_supply;
      var minp = 1;
      var maxp = totalSupply;
      // The result should be between 100 an 10000000
      var minv = Math.log(1000);
      
      // const coingeckoMarketData = this.$store.state.runeMarketData.coingeckoMarketData;
      // const totalSupply = coingeckoMarketData.total_supply;
      
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

    const v1Net = this.$store.state.networkHealth.v1SinglechainNetwork
    const v1Bm = v1Net.bondMetrics;

    const supActiveBonded =
      bm.totalActiveBond && bm.totalActiveBond !== "0"
        ? parseInt(bm.totalActiveBond, 10) / 10 ** 8
        : 0;
    const v1SupActiveBonded =
      v1Bm.totalActiveBond && v1Bm.totalActiveBond !== "0"
        ? parseInt(v1Bm.totalActiveBond, 10) / 10 ** 8
        : 0;

    const supSandbyBonded =
      bm.totalStandbyBond && bm.totalStandbyBond !== "0"
        ? parseInt(bm.totalStandbyBond, 10) / 10 ** 8
        : 0;
    const v1SupSandbyBonded =
      v1Bm.totalStandbyBond && v1Bm.totalStandbyBond !== "0"
        ? parseInt(v1Bm.totalStandbyBond, 10) / 10 ** 8
        : 0;

    const totalBonded = supActiveBonded + v1SupActiveBonded + supSandbyBonded + v1SupSandbyBonded;
    const supPooled =
      net.totalPooledRune && net.totalPooledRune !== "0"
        ? parseInt(net.totalPooledRune, 10) / 10 ** 8
        : 0;
    // note: v1 the field is totalStaked
    // http://157.90.98.200:8080/v1/doc#operation/GetNetworkData
    const v1SupPooled =
      v1Net.totalStaked && v1Net.totalStaked !== "0"
        ? parseInt(v1Net.totalStaked, 10) / 10 ** 8
        : 0;

    const supUnlocked = circulatingSupply - (totalBonded + (supPooled + v1SupPooled));
    const supUnreleased = totalSupply - circulatingSupply;
    const supReserve =
      net.totalReserve && net.totalReserve !== "0"
        ? parseInt(net.totalReserve, 10) / 10 ** 8
        : 0;
    const v1SupReserve =
      v1Net.totalReserve && v1Net.totalReserve !== "0"
        ? parseInt(v1Net.totalReserve, 10) / 10 ** 8
        : 0;

    return {
      hoveringId: null,
      chartData: [
        {
          name: "Unlocked",
          value: supUnlocked,
          // logValue: this.logScale(supUnlocked),
          color: "#3f4456",
          child: {
            name: "Active Bonded",
            value: supActiveBonded + v1SupActiveBonded,
            // logValue: this.logScale(supActiveBonded),
            color: "#2d99fe",
            child: {
              name: "Standby Bonded",
              value: supSandbyBonded + v1SupSandbyBonded,
              // logValue: this.logScale(supSandbyBonded),
              color: "#5e2bbc",
              child: {
                name: "Pooled",
                value: supPooled + v1SupPooled,
                // logValue: this.logScale(supPooled),
                color: "#f8c950",
              },
            },
          },
        },
        {
          name: "Reserve",
          value: supReserve + v1SupReserve,
          // logValue: this.logScale(supReserve),
          color: "#19ceb8",
        },
        {
          name: "Unreleased",
          value: supUnreleased,
          // logValue: this.logScale(supUnreleased),
          color: "#4346d3",
        },
      ],
    };
  },
  computed: {
    totalSupply() {
      const coingeckoMarketData = this.$store.state.runeMarketData.coingeckoMarketData;
      return coingeckoMarketData.total_supply;
    },
    dataProportions() {
      return getProportions(this.chartData, 1040, 380);
    },
  },
};
</script>

<style lang="scss" scoped>
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
  min-width: 450px;
}
.location-squarebox-lvl1 {
  position: relative;
  color: white;
  text-align:center;
  border: 1px solid rgba(0,0,0,0.3);
}
.location-squarebox-inner {
  position: absolute;
  bottom: 0;
  right: 0;
  border-top: 1px solid rgba(0,0,0,0.3);
  border-left: 1px solid rgba(0,0,0,0.3);
}
.squarebox-label {
  font-size: 11px;
  padding-top: 8%;
  position: relative;
  height: 100%;

  color: #FFFFFF;
  font-family: Montserrat;
  font-size: 14px;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 600;

  > .app-tooltip {
    visibility: hidden;
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 30%;
    top: 20%;
    z-index: 10;

    font-weight: bold;
    font-size: 12px;
    writing-mode: horizontal-tb;
    text-orientation: mixed;

    > .app-tooltip__body {
      flex: 1;
      margin: auto;
    }
  }
}
.squarebox-label--hover > .app-tooltip {
  visibility: visible !important;
}
.location-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  padding-bottom: 28px;
  cursor: default;
  > div {
    margin-right: 16px;
  }

  .location-legendcolor {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 8px;
  }
  .location-legendcolor--unlocked { background-color: #3f4456; }
  .location-legendcolor--activebonded { background-color: #2d99fe; }
  .location-legendcolor--standbybonded { background-color: #5e2bbc; }
  .location-legendcolor--pooled { background-color: #f8c950; }
  .location-legendcolor--reserve { background-color: #19ceb8; }
  .location-legendcolor--unreleased { background-color: #4346d3; }
}
</style>
