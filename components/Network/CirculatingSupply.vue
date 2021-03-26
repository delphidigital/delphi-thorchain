<template>
  <div class="cirq-supply">
    <h3 class="section__subtitle">
      Circulating Supply
    </h3>
    <div class="cirq-supply-container">
      <div class="cirq-supply-bar-container">
        <svg viewBox="0 0 525 50">
          <line
            x1="10"
            y1="9"
            :x2="maxBarWidth"
            y2="9"
            stroke="#2D3958"
            stroke-width="18"
            style="stroke-linecap: round;"
          />
          <line
            x1="10"
            y1="9"
            :x2="linePercentWidth"
            y2="9"
            stroke="#16ceb9"
            stroke-width="12"
            style="stroke-linecap: round;"
          />
        </svg>
        <div class="cirq-supply-bar-tooltip app-tooltip">
          <div class="app-tooltip__body">
            <p class="app-tooltip__text" style="font-weight: bold; font-size: 12px;">
              {{formatValue(circulatingSupply)}}
            </p>
          </div>
        </div>
      </div>
      <div class="cirq-supply-max">
        <div>{{formatValue(circulatingSupply)}}</div>
        <div>{{formatValue(maxSupply)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';

export default {
  data() {
    return {
      maxBarWidth: 515
    }
  },
  computed: {
    circulatingSupply() {
      return this.$store.state.runeMarketData.coingeckoMarketData.circulating_supply;
    },
    maxSupply() {
      return this.$store.state.runeMarketData.coingeckoMarketData.total_supply;
    },
    linePercentWidth() {
      return (this.circulatingSupply / this.maxSupply) * this.maxBarWidth;
    },
  },
  methods:{
    formatValue(value) {
      const thousandsConvert = value / 1000;
      return `${numeral(thousandsConvert).format('(0,0)').replace(',','.')}K`;
    },
  },
};
</script>

<style lang="scss" scoped>


.cirq-supply > .section__subtitle{
    margin-bottom: 14px;
    margin-top: 6px;
}

.cirq-supply-container {
  width: 100%;
  margin: 0 auto;
  /* height: 130px; */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cirq-supply-bar-container {
  position: relative;
  &:hover {
    .cirq-supply-bar-tooltip {
      display: block;
    }
  }
}

.cirq-supply-bar-tooltip {
  display: none;
  position: absolute;
  top: -50px;
  right: calc(50% - 130px);
  background-color: $color-bg-popup;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  width: 260px;
}

.cirq-supply-bar-tooltip:before {
  content: "";
  position: absolute;
  width: 0px;
  height: 0px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid $color-bg-popup;
  bottom: -6px;
  left: calc(50% - 6px);
}

.cirq-supply-max {
  display: flex;
  flex-direction: row;
  margin-top: -14px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.7;

  > div {
    flex: 1;

    &:last-child {
      text-align: right;
    }
  }
}
</style>
