<template>
  <div class="incentive-pendulum">
    <div class="incentive-pendulum-container">
      <div class="incentive-pendulum-header">
        <p class="incentive-label">
          Nodes
        </p>
        <p class="incentive-label">
          Liquidity Providers
        </p>
      </div>
      <div class="incentive-pendulum-bar-container">
        <svg viewBox="0 0 525 50">
          <line
            x1="10"
            y1="9"
            x2="515"
            y2="9"
            stroke="#2D3958"
            stroke-width="18"
            style="stroke-linecap: round;"
          />
          <line
            x1="10"
            y1="9"
            :x2="515"
            y2="9"
            stroke="#532bbc"
            stroke-width="12"
            style="stroke-linecap: round;"
          />
          <line
            x1="10"
            y1="9"
            :x2="(1 - poolShareFactor) * 515"
            y2="9"
            stroke="#16ceb9"
            stroke-width="12"
            style="stroke-linecap: round;"
          />
          <line
            :x1="efficient * 515 + 6"
            y1="3"
            :x2="efficient * 515 + 6"
            y2="23"
            stroke="#fff"
            stroke-width="2"
            stroke-dasharray="2"
          />
          <text
            :x="efficient * 515 - 20"
            y="35"
            font-family="Montserrat"
            font-weight="300"
            fill="#A6B0C3"
            class="svg-label-small"
          >
            Efficient
          </text>
          <text
            :x="efficient * 515 - 40"
            y="50"
            font-family="Montserrat"
            font-weight="300"
            fill="#A6B0C3"
            class="svg-label-big"
          >
            Efficient
          </text>
        </svg>
        <div class="incentive-pendulum-bar-tooltip">
          <div class="app-tooltip__body">
            <table class="app-tooltip__table">
              <tbody>
                <tr>
                  <td class="incentive-tooltip-data">
                    <span class="incentive-mark incentive-mark-node" />
                    Node Operator Rewards
                  </td>
                  <td class="align-right app-tooltip__table__data--highlight">
                    {{ formatPercentage(1 - poolShareFactor) }}
                  </td>
                </tr>
                <tr>
                  <td class="incentive-tooltip-data">
                    <span class="incentive-mark incentive-mark-staker" />
                    Staker Rewards
                  </td>
                  <td class="align-right app-tooltip__table__data--highlight">
                    {{ formatPercentage(poolShareFactor) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="incentive-tooltip-roi">
        <div>ROI: {{ apy.bondingAPY }}% APY</div>
        <div>ROI: {{ apy.liquidityAPY }}% APY</div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPercentageFloat } from '../../../lib/formatHelpers.mjs';

export default {
  computed: {
    poolShareFactor() {
      return this.$store.state.networkHealth.poolShareFactor;
    },
    apy() {
      return {
        bondingAPY: parseFloat(this.$store.state.networkHealth.network.bondingAPY).toFixed(2),
        liquidityAPY: parseFloat(this.$store.state.networkHealth.network.liquidityAPY).toFixed(2),
      };
    },
    efficient() {
      return 0.5;
    },
  },
  methods: {
    formatPercentage(v) {
      return formatPercentageFloat(v);
    },
  },
};
</script>

<style lang="scss" scoped>
.svg-label-small {
  font-size: 12px;
  @media (max-width: 400px) {
    display: none;
  }
}

.svg-label-big {
  font-size: 24px;
  display: none;
  @media (max-width: 400px) {
    display: block;
  }
}

.incentive-pendulum {
  padding: 20px 25px;
}

.network-incentive-pendulum {
  padding-left: 25px;
  padding-right: 25px;
  padding-top: 20px;
  height: 105px;
}

.incentive-pendulum-container {
  width: 100%;
  margin: 0 auto;
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.incentive-pendulum-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.incentive-label {
  font-size: 14px;
  color: white;
  font-weight: 600;
}

.status-value {
  display: flex;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: 400;
    display: inline-block;
    margin-left: 5px;
    text-transform: capitalize;
  }
}

.incentive-pendulum-bar-container {
  position: relative;
  &:hover {
    .incentive-pendulum-bar-tooltip {
      display: block;
    }
  }
}

.incentive-pendulum-bar-tooltip {
  display: none;
  position: absolute;
  top: -80px;
  right: calc(50% - 130px);
  background-color: $color-bg-popup;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  width: 260px;
}

.incentive-pendulum-bar-tooltip:before {
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

.value--success {
  color: $color-green;
}

.value--danger {
  color: $color-red;
}

.align-right {
  text-align: right;
}

.incentive-tooltip-data {
  display: flex;
  align-items: center;
}

.incentive-tooltip-roi {
  display: flex;
  flex-direction: row;
  margin-top: -14px;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;

  > div {
    flex: 1;

    &:last-child {
      text-align: right;
    }
  }
}

.incentive-mark {
  display: inline-block;
  width: 12px;
  height: 4px;
  border-radius: 3px;
  margin-right: 8px;
}

.incentive-mark-staker {
  background-color: $color-purple;
}

.incentive-mark-node {
  background-color: $color-green;
}
</style>
