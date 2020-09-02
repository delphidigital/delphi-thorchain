<template>
  <div v-if="$store.state.modals.slippageCalculator" class="slippage-calculator">
    <div
      class="slippage-calculator__overlay"
      @click="$store.commit('modals/toggleSlippageCalculator')"
    />
    <div class="slippage-calculator__body">
      <img
        class="slippage-calculator__close"
        src="/close.svg"
        @click="$store.commit('modals/toggleSlippageCalculator')"
      >
      </img>
      <h3 class="slippage-calculator__title">
        Slippage Calculator
      </h3>

      <div class="slippage-calculator__form">
        <div class="slippage-calculator__inputs">
          <div class="slippage-calculator__form-control">
            <label class="label">Pool</label>
            <select class="input input--select" :value="currentPool" @change="setPool">
              <option v-for="pool in pools" :key="pool">
                {{ pool }}
              </option>
            </select>
          </div>

          <div class="slippage-calculator__form-control">
            <label class="label">Buy or Sell</label>
            <select
              class="input input--select"
              :value="currentSide"
              @change="setSide"
            >
              <option v-for="opt in sides" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="slippage-calculator__form-control">
            <label class="label">Amount</label>
            <div class="money-input-container">
              <span class="money-input-currency">
                {{ inputSymbol }}
              </span>
              <input
                type="number"
                class="input input--money"
                min="0"
                @change="setAmount"
              >
              </input>
            </div>
          </div>
        </div>

        <button class="slippage-calculator__submit" @click="refreshResults">
          Show Result
        </button>
      </div>

      <hr class="section__divider"></hr>

      <div class="slippage-calculator__result">
        <label class="label">Result</label>
        <div class="slippage-calculator__result-group">
          <div class="item item--big border-bottom">
            <p class="text-lg">
              <Percentage :value="calculationResult.totalPercentage" />
            </p>
            <p class="slippage-calculator__item-label">
              Slippage
            </p>
          </div>

          <div class="item item--small border-right">
            <p class="text-md">
              <Percentage :value="calculationResult.feePercentage" />
            </p>
            <p class="text-xs">
              Fee
            </p>
          </div>

          <div class="item item--small">
            <p class="text-md">
              <Percentage :value="calculationResult.slipPercentage" />
            </p>
            <p class="text-sm">
              Slip
            </p>
          </div>
        </div>
        <div class="slippage-calculator__result-group">
          <div class="item item--big">
            <p class="text-lg">
              {{ outputSymbol }} {{ calculationResult.expectedAmount.toFixed(6) }}
            </p>
            <p class="text-sm">
              Expected amount you would receive
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { assetFromString, AssetSymbol } from '@thorchain/asgardex-util';
import Percentage from '../../Common/Percentage.vue';

export default {
  components: {
    Percentage,
  },
  data() {
    const poolIds = this.$store.state.pools.poolIds;
    return {
      pools: poolIds,
      sides: [{
        label: 'Buy',
        value: 'buy',
      }, {
        label: 'Sell',
        value: 'sell',
      }],
    };
  },
  computed: {
    assetSymbol() {
      const asset = assetFromString(this.currentPool);
      const symbol = asset.symbol.split('-')[0];
      return AssetSymbol[symbol] || symbol;
    },
    currentAmount() {
      return this.$store.state.slippageCalculator.amount || 5;
    },
    currentPool() {
      return this.$store.state.slippageCalculator.pool || this.pools[0];
    },
    currentSide() {
      return this.$store.state.slippageCalculator.side || 'buy';
    },
    calculationResult() {
      return this.$store.state.slippageCalculator.calculationResult;
    },
    inputSymbol() {
      if (this.currentSide === 'buy') {
        return AssetSymbol.RUNE;
      }
      return this.assetSymbol;
    },
    outputSymbol() {
      if (this.currentSide === 'buy') {
        return this.assetSymbol;
      }
      return AssetSymbol.RUNE;
    },
  },
  methods: {
    refreshResults() {
      const amount = this.currentAmount;
      const pool = this.currentPool;
      const side = this.currentSide;
      this.$store.dispatch('slippageCalculator/calculate', { amount, side, pool });
    },
    setPool(e) {
      this.$store.commit('slippageCalculator/setPool', e.target.value);
    },
    setSide(e) {
      this.$store.commit('slippageCalculator/setSide', e.target.value);
    },
    setAmount(e) {
      this.$store.commit('slippageCalculator/setAmount', e.target.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.slippage-calculator {
  width: 100%;
  height: 100%;
  position: fixed;
  background-color: rgba(11, 14, 22, 0.8);
  top: 0px;
  left: 0px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: scroll;
}

.slippage-calculator__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.slippage-calculator__body {
  position: relative;
  background-color: $color-bg;
  width: 98%;
  max-width: 555px;
  border-radius: 8px;
  z-index: 60;
  overflow-y: scroll;
}

.slippage-calculator__title {
  font-size: 17px;
  padding: 16px 0;
  text-align: center;
  display: block;
  font-weight: 600;
  border-bottom: 1px solid $color-border;
}

.slippage-calculator__form {
  padding: 30px;
}

.slippage-calculator__inputs {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
}

.slippage-calculator__form-control {
  display: flex;
  flex-direction: column;
  width: 31%;
  margin-top: 10px;

  @media screen and (max-width: 600px) {
    width: 100%;
  }
}

/* TODO(Fede): This may be promoted to global
* else we should namespace with splippage-calculator
*/
.label {
  text-transform: uppercase;
  font-weight: 400;
  font-size: 11px;
  color: $color-text-secondary;
  margin-bottom: 8px;
}

.input {
  position: relative;
  border: 1px solid $color-border;
  background-color: #262e4a;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  padding-right: 13px;
  padding-left: 13px;
  height: 37px;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border: 1px solid $color-border;
  }
}

.input--select {
  background-image: url('/arrow_down.svg');
  background-repeat: no-repeat;
  background-position: right 15px center;
}

.input--money {
  padding-left: 45px;
  width: 100%;
}

.money-input-container {
  position: relative;
}

.money-input-currency {
  display: block;
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 11px;
  padding: 3px;
  background-color: $color-bg-tint;
  z-index: 10;
  border-radius: 4px;
}

.slippage-calculator__submit {
  margin-top: 20px;
  background-color: #4346D3;
  color: #fff;
  height: 36px;
  width: 100%;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 400;

  &:hover, &:focus {
    border: none;
  }
}

.slippage-calculator__close {
  position: absolute;
  font-family: sans-serif;
  display: block;
  cursor: pointer;
  top: 16px;
  right: 16px;
}

.slippage-calculator__result {
  padding: 30px;
}

.slippage-calculator__result-group {
  background-color: #262e4a;
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
  border-radius: 8px;
}

.item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
}

.item--big {
  width: 100%;
}

.item--small {
  width: 50%;
}

.border-right {
  border-right: 1px solid $color-border;
}

.border-bottom {
  border-bottom: 1px solid $color-border;
}

.text-lg {
  font-size: 24px;
  font-weight: 600;
}

.text-md {
  font-size: 16px;
  font-weight: 600;
}

.text-sm {
  font-size: 12px;
  font-weight: 300;
}
</style>
