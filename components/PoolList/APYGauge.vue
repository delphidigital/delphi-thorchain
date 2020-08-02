<template>
  <div class="apy-gauge-container">
    <div class="apy-gauge">
      <div
        class="apy-gauge__primary"
        :style="{ width: (apyRealRewards * 100) + '%' }"
      />
    </div>
    <div class="app-tooltip apy-gauge-tooltip">
      <div class="app-tooltip__header">
        {{ name }}
      </div>
      <div class="app-tooltip__body apy-gauge-tooltip-body">
        <table class="app-tooltip__table">
          <tbody>
            <tr>
              <td class="apy-gauge-tooltip-data">
                <span class="apy-mark apy-mark-real" />
                Real rewards
              </td>
              <td class="app-tooltip__table__data--highlight">
                <Percentage :value="apyRealRewards" />
              </td>
            </tr>
            <tr>
              <td class="apy-gauge-tooltip-data">
                <span class="apy-mark apy-mark-block" />
                Block rewards
              </td>
              <td class="app-tooltip__table__data--highlight">
                <Percentage :value="1 - apyRealRewards" />
              </td>
            </tr>
          </tbody>
        </table>
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
  props: {
    name: {
      type: String,
      default: '',
    },
    apyRealRewards: {
      type: Number,
      default: null,
    },
  },
};
</script>

<style lang="scss" scoped>
.apy-gauge-container {
  position: relative;
  cursor: pointer;
  &:hover {
    .apy-gauge-tooltip {
      display: block;
    }
  }
}

.apy-gauge {
  width: 80px;
  height: 6px;
  z-index: 0;
  background-color: $color-green;
  border-radius: 3px;
}

.apy-gauge__primary {
  height: 6px;
  background-color: $color-purple;
  z-index: 1;
  border-radius: 3px;
  position: relative;
  left: -1px;
}

.apy-gauge-tooltip {
  display: none;
  z-index: 100;
  position: absolute;
  left: -60px;
  bottom: 18px;
  width: 200px;

  @media screen and (max-width: $pureg-lg) {
    bottom: -40px;
    left: -220px;
  }
}

.apy-gauge-tooltip-body {
  position: relative;
}

.apy-gauge-tooltip-body::before {
  content: "";
  position: absolute;
  width: 0px;
  height: 0px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid $color-bg-popup;
  bottom: -6px;
  left: calc(50% - 6px);
  @media screen and (max-width: $pureg-lg) {
    border-left: 6px solid $color-bg-popup;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    left: calc(100%);
    top: calc(50% - 16px);
  }
}

.apy-gauge-tooltip-data {
  display: flex;
  align-items: center;
}

.apy-mark {
  display: inline-block;
  width: 12px;
  height: 4px;
  border-radius: 3px;
  margin-right: 8px;
}

.apy-mark-real {
  background-color: $color-purple;
}

.apy-mark-block {
  background-color: $color-green;
}
</style>
