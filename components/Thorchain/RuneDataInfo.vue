<template>
  <div class="section">
    <div class="section__header" id="pool-prediction-analysis">
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
      <a class="deeplink-selector" href="#pool-prediction-analysis">
        <Icon
          name="link"
          scale="0.7"
        ></Icon>
      </a>
      <a class="tweet__link" :href="tweetRunePredictionAnalysis" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
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
            />
          </div>
        </div>

        <div class="section__pool_select">
          <div class="section__headtitle">POOL</div>
          <div class="dropdown">
            <select
              v-model="selectedPool"
              class="dropdown-select"
              @change="onChangePool($event)"
            >
              <option disabled value="">Select Pool…</option>
              <option
                v-for="item in poolListOptions()"
                :key="item"
                :value="item"
              >
                {{ displayPoolName(item) }}
              </option>
            </select>
          </div>
        </div>

        <div class="section__date_invested" v-if="plot !== 'predict_future'">
          <div class="section__headtitle">DATE INVESTED</div>
          <div>
            <date-picker
              v-model="dateInvested"
              valueType="format"
              prefix-class="customdatepkr"
            >
            </date-picker>
          </div>
        </div>

        <div class="section__date_invested" v-if="plot == 'predict_future'">
          <div class="section__headtitle">PREDICT RESULT ON</div>
          <div>
            <date-picker
              v-model="predictResultOnDate"
              valueType="format"
              prefix-class="customdatepkr"
            >
            </date-picker>
          </div>
        </div>
        
        <div class="submit-button-wrapper">
          <button v-if="plot != 'predict_future'" @click="formUpdatedGetData">
            Update
          </button>
        </div>
      </div>



      <div v-if="plot == 'predict_future'" class="section__headinputs">
        <div class="section__rune_ptarget">
          <div class="section__headtitle">
            PRICE TARGET FOR RUNE
          </div>
          <div class="amountinput-wrapper">
            <Icon
              class="amountinput-icon"
              name="dollar-sign"
              scale="0.7"
              @click="focusRunePTargetInput"
            >
            </Icon>
            <input
              v-model="runeTargetPrice"
              placeholder="RUNE price"
              name="rune_ptarget"
              ref="runePTargetRef"
              type="number"
              min="0.00"
              step="0.01"
            />
          </div>
        </div>
        <div class="section__asset_ptarget">
          <div class="section__headtitle">
            PRICE TARGET FOR ASSET
          </div>
          <div class="amountinput-wrapper">
            <Icon
              class="amountinput-icon"
              name="dollar-sign"
              scale="0.7"
              @click="focusAssetPTargetInput"
            >
            </Icon>
            <input
              v-model="assetTargetPrice"
              placeholder="Asset price"
              name="asset_ptarget"
              ref="assetPTargetRef"
              type="number"
              min="0.00"
              step="0.01"
            />
          </div>
        </div>
        <div class="section__roiavg">
          <div class="section__headtitle">USE AVERAGE ROI OF THE LAST</div>
          <div class="dropdown">
            <select
              v-model="selectedRoiAvg"
              class="dropdown-select"
            >
              <option disabled value="">Select…</option>
              <option key="3days" value="3days">3 Days</option>
              <option key="7days" value="7days">7 Days</option>
              <option key="14days" value="14days">14 Days</option>
              <option key="30days" value="30days">30 Days</option>
            </select>
          </div>
        </div>
        <div class="submit-button-wrapper">
          <div class="submit-button-wrapper">
            <button @click="formUpdatedGetData">
              Update
            </button>
          </div>
        </div>
      </div>



      <div v-if="selectedPool && (plot == 'rewards' || plot == 'total_value')">
        <LineChart
          :data="getPlotData"
          :format-label="formatLabel"
          :y-axis-label-options="yAxisLabelOptions"
          class="runedatainfo-chart"
        />
      </div>
      <div v-if="selectedPool && plot == 'profit_loss'">
        <ColumnChart
          :chart-data="getProfitLossData"
          :format-label="formatLabel"
          :format-label-axis="formatLabelAxis"
          :x-axis-categories="xAxisProfitColumCategories"
          :custom-plot-options="customPlotOptionsColumn"
          :custom-tooltip-options="customTooltipOptionsColumn"
          class="runedatainfo-chart"
        />
      </div>
      <div v-if="selectedPool && plot == 'predict_future'">
        <ColumnChart
          :chart-data="getPredictFutureData"
          :format-label="formatLabel"
          :format-label-axis="formatLabelAxis"
          :x-axis-categories="xAxisPredictColumCategories"
          :custom-plot-options="customPlotOptionsColumn"
          :custom-tooltip-options="customTooltipOptionsColumn"
          class="runedatainfo-chart"
        />
      </div>
      <div v-if="selectedPool" class="section__footer__credits">
        Inspired by Runedata.info
      </div>
    </div>
  </div>
</template>

<script>
import { format, parse, startOfMonth } from "date-fns";
import numeral from "numeral";
import DatePicker from "vue2-datepicker";
import { calculatePLBreakdown, getPastSimulation, calculatePrediction } from '../../lib/runeDataInfoCalculateUserData.mjs';
import LineChart from "./LineChart.vue";
import ColumnChart from "./ColumnChart.vue";
import { poolNameWithoutAddr } from '../../lib/utils';

export default {
  components: { DatePicker, LineChart, ColumnChart },
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = '/thorchain/testnet'; // TODO: include mainnet too
    const poolPredictionAnalysisDeepLink = `${baseUrl}${tabBasePath}#pool-prediction-analysis`;
    return {
      tweetRunePredictionAnalysis: `http://twitter.com/intent/tweet?text=${encodeURIComponent('RUNE prediction analysis')}&url=${encodeURIComponent(poolPredictionAnalysisDeepLink)}`,
      amountInvested: "100000.00",
      selectedPool: null,
      selectedRoiAvg: null,
      runeTargetPrice: this.$store.state.pools.pools.length
        ? (this.$store.state.pools.pools[0].poolStats.period1H.assetPriceUSD / this.$store.state.pools.pools[0].poolStats.period1H.assetPrice).toFixed(2)
        : '',
      assetTargetPrice: '',
      dateInvested: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      predictResultOnDate: null,
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
      xAxisProfitColumCategories: [
        'Rune price movement',
        'Asset price movement',
        'Rewards',
        'Impermanent loss',
        'Total profit',
      ],
      xAxisPredictColumCategories: [
        'Provide liquidity',
        'Hold 100% RUNE',
        'Hold 100% asset',
        'Hold RUNE: Asset 50:50',
      ],
      pastSimulationData: [],
      predictionData: null,
      profitLossBreakdown: null,
      customPlotOptionsColumn: { series: { marker: { enabled: false, }, dataLabels: { enabled: true } } },
      customTooltipOptionsColumn: { enabled: false },
    };
  },
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

          this.getUtteranceDataWithTooltip(this.profitLossBreakdown.runeMovement.value, '#2d99fe'),
          this.getUtteranceDataWithTooltip(this.profitLossBreakdown.assetMovement.value, '#4346d3'),
          this.getUtteranceDataWithTooltip(this.profitLossBreakdown.fees.value, '#5e2bbc'),
          this.getUtteranceDataWithTooltip(this.profitLossBreakdown.impermLoss.value, '#f8c950'),
          this.getUtteranceDataWithTooltip(this.profitLossBreakdown.total.value, '#19ceb8', true),
        ],
      }];
    },
    getPredictFutureData() {
      if (!this.predictionData) {
        return [];
      }
      const pd = this.predictionData.prediction;
      return [{
        data: [
          this.getUtteranceDataWithTooltip(pd.keepProvidingLiquidity.change, '#19ceb8'),
          this.getUtteranceDataWithTooltip(pd.withdrawAndHoldRune.change, '#2d99fe'),
          this.getUtteranceDataWithTooltip(pd.withdrawAndHoldAsset.change, '#4346D3'),
          this.getUtteranceDataWithTooltip(pd.withdrawAndHoldBoth.change, '#f7517f'),
        ]
      }];
    },
  },
  methods: {
    getUtteranceDataWithTooltip(y, color, highlightValue) {
      let fontColor = '#ffffff';
      if (highlightValue) {
        fontColor = y > 0 ? '#19ceb8' : '#FF5555';
      }
      return {
        color,
        y,
        dataLabels: {
          overflow: 'justify',
          borderRadius: 4,
          verticalAlign: y > 0 ? 'top' : 'bottom',
          y: y > 0 ? -65 : 65,
          className: 'tooltip__body',
          useHTML: true,
          shadow: true,
          backgroundColor: '#30354b',
          color: fontColor,
          align: 'center',
          padding: 12,
          style: {
            padding: '8px 12px', fontSize: '13px'
          },
          formatter: () => this.formatLabel(y),
        },
      }
    },
    displayPoolName(name) {
      return name ? poolNameWithoutAddr(name) : name;
    },
    onChangePool(event) {
      if (event.target.value) {
        const pool = this.$store.state.pools.pools.find(p => p.poolId === event.target.value);
        if (pool) {
          this.assetTargetPrice = pool.poolStats.period1H.assetPriceUSD
            ? parseFloat(pool.poolStats.period1H.assetPriceUSD).toFixed(2)
            : pool.poolStats.period1H.assetPriceUSD;
        }
      }
    },
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

      if (this.predictResultOnDate && this.selectedRoiAvg && this.runeTargetPrice && this.assetTargetPrice) {
        const predictResultOnDate = parse(this.predictResultOnDate, "yyyy-MM-dd", new Date());
        const runetg = parseFloat(this.runeTargetPrice);
        const assettg = parseFloat(this.assetTargetPrice);
        if (!runetg || !assettg ||  isNaN(runetg) || isNaN(assettg) || isNaN(predictResultOnDate.getTime())) {
          return;
        }
        this.predictionData = calculatePrediction(
          amountInvested, predictResultOnDate.getTime(), this.selectedPool, this.selectedRoiAvg, runetg, assettg, this.$store.state.pools,
        );
      }
    },
    focusAmountInvestedInput() {
      this.$refs.amountInvestedRef.focus();
    },
    focusRunePTargetInput() {
      this.$refs.runePTargetRef.focus();
    },
    focusAssetPTargetInput() {
      this.$refs.assetPTargetRef.focus();
    },
    formatLabel(value) {
      return numeral(value).format("$0,0.0a").toUpperCase();
    },
    formatLabelAxis(value) {
      return numeral(value).format("$0,0a").toUpperCase();
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
.section__footer__credits {
  background-color: transparent;
  font-size: 11px;
  text-align: right;
  padding: .5rem 1.2rem 1.2rem .5rem;
  /* background-color: #262f4a; */
  color: rgba(255,255,255,0.7);
}
.submit-button-wrapper {
  justify-content: space-between;
  align-self: flex-end;
  flex: 0.5 !important;
  > button {
    font-size: 13px;
    font-weight: 500;
    margin: 0;
    border-radius: 15px;
    padding: 13px 25px;
    color: rgba(255, 255, 255, 0.5);
    background-color: $color-bg-tint;
    border: none;
  }
  > button:hover {opacity: 0.8;}
  > button:focus {background-color: $color-bg-popup;}

}
.section > .section__header {
  > .section__title {
    font-size: 15px;
    height: 58px;
    line-height: 58px;
    flex: none;
    margin-right: 28px;
    border-bottom: 2px solid transparent;
    color: #8f929e;
    cursor: pointer;
  }
  > .section__title--empty {
    flex: 1;
    margin: 0;
  }
  > .plot--active {
    color: white;
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
.section__headinputs:last-child {
  > div {
    border-bottom: 1px solid #353c50;
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
    line-height: 20px;
    height: 38px;
    width: 100%;
    color: white;
    caret-color: white;
    font-weight: 600;
  }
  input:focus,
  input:hover {
    outline: none;
    border: 1px solid rgba(120, 124, 170, 0.95);
  }
}
.runedatainfo-chart {
    /* background-color: #262f4a; */
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
  text-shadow: 0 1px black;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  background: transparent;
  color: white;
  font-weight: 600;
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

@media screen and (max-width: 750px) {
  .section__header {
    flex-direction: column;
    height: auto;
  }
  .section__headinputs {
    flex-direction: column;
    height: auto;
  }
  .deeplink-selector, .tweet__link {
    margin-bottom: 14px;
    margin-right: 0;
    &:first-child {
      margin-top: 14px;
    }
  }
}
</style>
