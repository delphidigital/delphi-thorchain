<template>
  <div class="section">
    <div class="section__header">
      <div class="section__title" :class="{'plot--active': plot == 'rewards'}" @click="setPlotRewards">
        Historical pool data
      </div>
      <div class="section__title" :class="{'plot--active': plot == 'total_value'}" @click="setPlotTotalValue">
        Total Value
      </div>
      <div class="section__title" :class="{'plot--active': plot == 'profit_loss'}" @click="setPlotProfitLoss">
        Profit / Loss Breakdown
      </div>
      <div class="section__title" :class="{'plot--active': plot == 'predict_future'}" @click="setPlotPredictFuture">
        Predict future returns
      </div>
      <div class="section__title section__title--empty"></div>
    </div>
    <div class="section__body">
      <div class="section__headinputs">

        <div class="section__capital_invested">
          <div class="section__headtitle">
            CAPITAL INVESTED
          </div>
          <div class="amountinput-wrapper">
            <Icon
              class="amountinput-icon"
              name="dollar-sign"
              scale="0.7"
              @click="focusAmountInvestedInput"
            >
            </Icon>
            <input
              v-model="amountInvested"
              placeholder="Amount invested"
              name="amount_invested"
              ref="amountInvestedRef"
              type="number"
              min="0.00"
              step="0.01"
              @change="formUpdatedGetData"
            />
          </div>
        </div>

        <div class="section__pool_select">
          <div class="section__headtitle">POOL</div>
          <div class="dropdown">
            <select
              v-model="selectedPool"
              @change="formUpdatedGetData"
              class="dropdown-select"
            >
              <option disabled value="">Select Pool…</option>
              <option
                v-for="item in poolListOptions()"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
        </div>

        <div class="section__date_invested">
          <div class="section__headtitle">DATE INVESTED</div>
          <div>
            <date-picker
              v-model="dateInvested"
              valueType="format"
              prefix-class="customdatepkr"
              @change="formUpdatedGetData"
            >
            </date-picker>
          </div>
        </div>
      </div>
      <div v-if="plot == 'rewards' || plot == 'total_value'">
        <LineChart
          :data="getPlotData"
          :format-label="formatLabel"
          :y-axis-label-options="yAxisLabelOptions"
          class="runedatainfo-chart"
        />
      </div>
      <div v-if="plot == 'profit_loss'">
        <ColumnChart
          :data="getProfitLossData"
          :format-label="formatLabel"
          :x-axis-categories="xAxisColumCategories"
          class="runedatainfo-chart"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { format, parse, startOfMonth } from "date-fns";
import numeral from "numeral";
import DatePicker from "vue2-datepicker";
import { calculatePLBreakdown, getPastSimulation } from '../../lib/runeDataInfoCalculateUserData.mjs';
import LineChart from "./LineChart.vue";
import ColumnChart from "./ColumnChart.vue";

export default {
  components: { DatePicker, LineChart, ColumnChart },
  data: () => ({
    amountInvested: "100000.00",
    selectedPool: null,
    dateInvested: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    plot: 'rewards',
    yAxisLabelOptions: {
      type: "linear",
      title: {
        text: "Volume",
        useHTML: true,
        style: {
          color: "rgba(255,255,255,0.7)",
        },
      },
    },
    xAxisColumCategories: [
      'Rune price movement',
      'Asset price movement',
      'Fees & incentives',
      'Impermanent loss',
      'Total profit',
    ],
    pastSimulationData: [],
    profitLossBreakdown: null,
  }),
  computed: {
    getPlotData() {
      if (this.plot === 'rewards') {
        return this.getPoolRewardsData();
      } else if (this.plot === 'total_value') {
        return this.getSimulationData();
      }
      return [];
    },
    getProfitLossData() {
      if (!this.profitLossBreakdown) {
        return [];
      }
      return [{
        data: [
          { y: this.profitLossBreakdown.runeMovement.value, color: '#19ceb8' },
          { y: this.profitLossBreakdown.assetMovement.value, color: '#2d99fe' },
          { y: this.profitLossBreakdown.fees.value, color: '#4346D3' },
          { y: this.profitLossBreakdown.impermLoss.value, color: '#f7517f' },
          { y: this.profitLossBreakdown.total.value, color: '#c4c634' },
        ]
      }];
    },
  },
  methods: {
    setPlotRewards() {
      if (this.plot === 'rewards') { return; }
      this.plot = 'rewards';
    },
    setPlotTotalValue() {
      if (this.plot === 'total_value') { return; }
      this.plot = 'total_value';
    },
    setPlotProfitLoss() {
      if (this.plot === 'profit_loss') { return; }
      this.plot = 'profit_loss';
    },
    setPlotPredictFuture() {
      if (this.plot === 'predict_future') { return; }
      this.plot = 'predict_future';
    },
    getSimulationData() {
      const totalValueLP = [];
      const totalValueIfHoldRune = [];
      const totalValueIfHoldAsset = [];
      const totalValueIfHoldBoth = [];
      this.pastSimulationData.forEach(data => {
        totalValueLP.push({
            x: data.timestamp * 1000,
            y: data.totalValue,
        });
        totalValueIfHoldRune.push({
            x: data.timestamp * 1000,
            y: data.totalValueIfHoldRune,
        });
        totalValueIfHoldAsset.push({
            x: data.timestamp * 1000,
            y: data.totalValueIfHoldAsset,
        });
        totalValueIfHoldBoth.push({
            x: data.timestamp * 1000,
            y: data.totalValueIfHoldBoth,
        });
      });
      return [
        { name: "Total value LP", color: "#19ceb8", data: totalValueLP },
        { name: "Total value if hold Rune", color: "#4346D3", data: totalValueIfHoldRune },
        { name: "Total value if hold asset", color: "#2d99fe", data: totalValueIfHoldAsset },
        { name: "Total value if hold both", color: "#f7517f", data: totalValueIfHoldBoth },
      ];
    },
    getPoolRewardsData() {
      const feeAccrued = [];
      const impermLoss = [];
      const totalGains = [];
      this.pastSimulationData.forEach(data => {
        feeAccrued.push({
            x: data.timestamp * 1000,
            y: data.feeAccrued * 100
        });
        impermLoss.push({
            x: data.timestamp * 1000,
            y: data.impermLoss * 100
        });
        totalGains.push({
            x: data.timestamp * 1000,
            y: data.totalGains * 100
        });
      });
      return [
        { name: "Fee & incentives accrued", color: "#19ceb8", data: feeAccrued },
        { name: "Impermanent loss", color: "#4346D3", data: impermLoss },
        { name: "Total gains vs HODL", color: "#2d99fe", data: totalGains },
      ];
    },
    poolListOptions() {
      return Object.keys(this.$store.state.pools.technicalAnalysis);
    },
    formUpdatedGetData() {
      if (!this.dateInvested || !this.selectedPool || !this.amountInvested) {
        return;
      }
      const dateInvested = parse(this.dateInvested, "yyyy-MM-dd", new Date());
      const amountInvested = parseFloat(this.amountInvested);
      if (
        !amountInvested ||
        isNaN(amountInvested) ||
        isNaN(dateInvested.getTime())
      ) {
        return;
      }
      this.pastSimulationData =  getPastSimulation(amountInvested, dateInvested, this.selectedPool, this.$store.state.pools);
      this.profitLossBreakdown = calculatePLBreakdown(this.pastSimulationData);
    },
    focusAmountInvestedInput() {
      this.$refs.amountInvestedRef.focus();
    },
    formatLabel(value) {
      return numeral(value).format("($0,0a)").toUpperCase();
    },
  },
};
</script>
<style lang="scss" scoped>
.runedata-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section > .section__header {
  > .section__title {
    font-size: 15px;
    height: 58px;
    line-height: 58px;
    flex: none;
    margin-right: 28px;
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }
  > .section__title--empty {
    flex: 1;
    margin: 0;
  }
  > .plot--active {
    border-bottom: 2px solid white;
  }
}

.section__headinputs {
  display: flex;
  flex-direction: row;
  > div {
    flex-direction: column;
    flex-basis: 0;
    flex: 1 1 0px;
    padding: 16px 22px;
    border-bottom: 1px solid #353c50;

    .section__headtitle {
      font-size: 12px;
      line-height: 15px;
      font-weight: 600;
      color: $color-text-secondary;
      text-align: left;
      padding: 8px 0;
    }
  }
}
.amountinput-wrapper {
  position: relative;
  background-color: #262f4a;
  border-radius: 16px;
  .amountinput-icon {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7em;
    position: absolute;
    top: 14px;
    left: 14px;
    cursor: text;
  }
  input {
    padding: 4px 8px 4px 25px;
    border: 1px solid rgba(112, 115, 150, 0.65);
    border-radius: 16px;
    background-color: transparent;
    font-family: Montserrat, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: rgb(190, 193, 226);
    caret-color: rgb(190, 193, 226);
    line-height: 20px;
    height: 38px;
    width: 100%;
  }
  input:focus,
  input:hover {
    outline: none;
    border: 1px solid rgba(120, 124, 170, 0.95);
  }
}
.runedatainfo-chart {
    background-color: #262f4a;
    border-top: 1px solid #353C50;
    padding: 15px 25px;
}
.dropdown {
  display: inline-block;
  position: relative;
  overflow: hidden;
  height: 38px;
  width: 100%;
  background-color: #262f4a;
  border: 1px solid;
  border-color: rgba(112, 115, 150, 0.65);
  border-radius: 16px;
  -webkit-box-shadow: inset 0 1px rgba(255, 255, 255, 0.1),
    0 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), 0 1px 1px rgba(0, 0, 0, 0.2);
}

.dropdown:before,
.dropdown:after {
  content: "";
  position: absolute;
  z-index: 2;
  top: 13px;
  right: 10px;
  width: 0;
  height: 0;
  border: 4px dashed;
  border-color: rgba(255, 255, 255, 0.8) transparent;
  pointer-events: none;
}
.dropdown:before {
  border-bottom-style: solid;
  border-top: none;
  border-bottom-color: #aaa;
}
.dropdown:after {
  margin-top: 7px;
  border-top-style: solid;
  border-bottom: none;
  border-top-color: #aaa;
}
.dropdown-select {
  position: relative;
  width: 130%;
  margin: 0;
  padding: 6px 8px 6px 10px;
  height: 38px;
  line-height: 14px;
  font-size: 12px;
  border: 0;
  border-radius: 16px;
  -webkit-appearance: none;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px black;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
}
.dropdown-select:focus,
.dropdown-select:hover {
  z-index: 3;
  width: 100%;
  outline: 2px solid rgba(120, 124, 170, 0.95);
  outline-offset: -2px;
  color: rgba(255, 255, 255, 0.8);
}
.dropdown-select > option {
  margin: 3px;
  padding: 6px 8px;
  border-radius: 3px;
  cursor: pointer;
  background: #444;
  text-shadow: 0 1px rgba(0, 0, 0, 0.4);
}

/* Fix for IE 8 putting the arrows behind the select element. */
.lt-ie9 .dropdown {
  z-index: 1;
}
.lt-ie9 .dropdown-select {
  z-index: -1;
}
.lt-ie9 .dropdown-select:focus {
  z-index: 3;
}
/* Dirty fix for Firefox adding padding where it shouldn't. */
@-moz-document url-prefix() {
  .dropdown-select {
    padding-left: 6px;
  }
}
</style>
