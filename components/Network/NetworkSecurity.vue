<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Security
      </h2>
    </div>
    <div class="section__body network-security">
      <div class="security-container">
        <div class="security-status">
          <p class="status-label">
            Status
          </p>
          <div class="status-value">
            <img :src="statusProps.icon"></img>
            <span :style="{ color: statusProps.color }">{{ status }}</span>
          </div>
        </div>
        <div class="security-bar-container">
          <svg viewBox="0 0 400 50">
            <line
              x1="10"
              y1="9"
              x2="390"
              y2="9"
              stroke="#2D3958"
              stroke-width="18"
              style="stroke-linecap: round;"
            />
            <line
              x1="10"
              y1="9"
              :x2="level * (390)"
              y2="9"
              :stroke="statusProps.color"
              stroke-width="12"
              style="stroke-linecap: round;"
            />
            <line
              :x1="optimal * 390 + 6"
              y1="3"
              :x2="optimal * 390 + 6"
              y2="23"
              stroke="#fff"
              stroke-width="2"
              stroke-dasharray="2"
            />
            <text
              :x="optimal * 390 - 20"
              y="35"
              font-family="Montserrat"
              font-size="12px"
              font-weight="300"
              fill="#A6B0C3"
            >
              Optimal
            </text>
          </svg>
          <div class="security-bar-tooltip">
            <div class="app-tooltip__body">
              <table class="app-tooltip__table">
                <tbody>
                  <tr>
                    <td>
                      RUNE Bonded
                    </td>
                    <td class="align-right">
                      {{ formatRuneAmount(runeBonded) }}
                      <span class="text--bold">
                        (<Percentage :value="runeBondedPercentage" />)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      RUNE Staked
                    </td>
                    <td class="align-right">
                      {{ formatRuneAmount(runeStaked) }}
                      <span class="text--bold">
                        (<Percentage :value="runeStakedPercentage" />)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import numeral from 'numeral';
import Percentage from '../Common/Percentage.vue';

export default {
  components: {
    Percentage,
  },
  data() {
    return {
      statusData: {
        insecure: {
          color: '#f7517f',
          icon: '/security_no.svg',
        },
        underbonded: {
          color: '#f7c951',
          icon: '/security_yellow.svg',
        },
        optimal: {
          color: '#16CEB9',
          icon: '/security_yes.svg',
        },
        overbonded: {
          color: '#f77651',
          icon: '/security_orange.svg',
        },
        inefficient: {
          color: '#f7517f',
          icon: '/security_no.svg',
        },
      },
    };
  },
  computed: {
    level() {
      // TODO(Fede): RUNE bonded by nodes / RUNE staked in pools
      return this.runeBondedPercentage;
    },
    totalRune() {
      return this.runeBonded + this.runeStaked;
    },
    runeBonded() {
      return this.$store.getters['nodes/totalActiveBonded'];
    },
    runeBondedPercentage() {
      if (!this.runeStaked || !this.totalRune) { return 0; }
      return this.runeBonded / this.totalRune;
    },
    runeStaked() {
      // return this.$store.state.networkHealth.totalStaked; // singlechain v1 is totalStaked
      return this.$store.state.networkHealth.totalPooledRune
    },
    runeStakedPercentage() {
      if (!this.runeStaked || !this.totalRune) { return 0; }
      return this.runeStaked / this.totalRune;
    },
    optimal() {
      return 0.6;
    },
    status() {
      if (this.level < 0.5) {
        return 'insecure';
      }
      if (this.level < 0.6) {
        return 'underbonded';
      }
      if (this.level < 0.75) {
        return 'optimal';
      }
      if (this.level < 0.9) {
        return 'overbonded';
      }
      return 'inefficient';
    },
    statusProps() {
      return this.statusData[this.status];
    },
  },
  methods: {
    formatRuneAmount(amount) {
      return `ᚱ${numeral(amount).format('(0,00.[0]a)')}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.network-security {
  padding-left: 25px;
  padding-right: 25px;
  padding-top: 20px;
  height: 105px;
}

.security-container {
  max-width: 400px;
  margin: 0 auto;
}

.security-status {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-label {
  font-size: 14px;
  color: $color-text-secondary;
  font-weight: 400;
}

.status-value {
  display: flex;
  align-items: center;

  span {
    font-size: 14px;
    font-weight: 400;
    diplay: inline-block;
    margin-left: 5px;
    text-transform: capitalize;
  }
}

.security-bar-container {
  position: relative;
  &:hover {
    .security-bar-tooltip {
      display: block;
    }
  }
}

.security-bar-tooltip {
  display: none;
  position: absolute;
  top: -80px;
  right: calc(50% - 125px);
  background-color: $color-bg-popup;
  font-size: 12px;
  border-radius: 4px;
  width: 250px;
}

.security-bar-tooltip:before {
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
</style>
