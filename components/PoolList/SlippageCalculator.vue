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
            <select v-model="currentPool" class="input input--select">
              <option v-for="pool in pools" :key="pool">
                {{ pool }}
              </option>
            </select>
          </div>

          <div class="slippage-calculator__form-control">
            <label class="label">Buy or Sell</label>
            <select v-model="currentBuyOrSell" class="input input--select">
              <option v-for="opt in ['Buy', 'Sell']" :key="opt">
                {{ opt }}
              </option>
            </select>
          </div>

          <div class="slippage-calculator__form-control">
            <label class="label">Amount</label>
            <div class="money-input-container">
              <span class="money-input-currency">
                BTC
              </span>
              <input
                v-model="currentAmount"
                type="number"
                class="input input--money"
                min="0"
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
              <Percentage :value="result.slippage" />
            </p>
            <p class="slippage-calculator__item-label">
              Slippage
            </p>
          </div>

          <div class="item item--small border-right">
            <p class="text-md">
              <Percentage :value="result.fee" />
            </p>
            <p class="text-xs">
              Fee
            </p>
          </div>

          <div class="item item--small">
            <p class="text-md">
              <Percentage :value="result.slip" />
            </p>
            <p class="text-sm">
              Slip
            </p>
          </div>
        </div>
        <div class="slippage-calculator__result-group">
          <div class="item item--big">
            <p class="text-lg">
              {{ `${result.expectedAmount.toFixed(6)} ${result.currency}` }}
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
import Percentage from '../Percentage.vue';

export default {
  components: {
    Percentage,
  },
  data() {
    const poolIds = this.$store.state.pools.poolIds;
    return {
      pools: poolIds,
      currentPool: poolIds[0],
      currentBuyOrSell: 'Buy',
      currentAmount: 0,
      result: {
        slippage: 0,
        fee: 0,
        slip: 0,
        expectedAmount: 0,
        currency: '',
      },
    };
  },
  methods: {
    refreshResults() {
      // TODO(Fede): This would get results based on the
      // corresponding params. Showing random stuff for now
      this.result = {
        slippage: Math.random() * 0.1,
        fee: Math.random() * 0.1,
        slip: Math.random() * 0.1,
        expectedAmount: Math.random(),
        currency: this.currentPool,
      };
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
