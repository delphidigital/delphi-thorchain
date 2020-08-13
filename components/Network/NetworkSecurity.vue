<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Security
      </h2>
    </div>
    <div class="section__body network-security">
      <div class="security-status">
        <p class="status-label">
          Status
        </p>
        <div class="status-value">
          <img :src="level >= optimal ? '/security_yes.svg' : '/security_no.svg'"></img>
          <span v-if="level >= optimal" class="value--success">{{ status }}</span>
          <span v-else class="value--danger">{{ status }}</span>
        </div>
      </div>
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
          :stroke="level >= optimal ? '#16ceb9' : '#f7517f'"
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
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    level() {
      // TODO(Fede): RUNE bonded by nodes / RUNE staked in pools
      return 0.8;
    },
    optimal() {
      return 0.6;
    },
    status() {
      if (this.level < 0.5) {
        return 'Insecure';
      }
      if (this.level < 0.6) {
        return 'Underbonded';
      }
      if (this.level < 0.75) {
        return 'Optimal';
      }
      if (this.level < 0.9) {
        return 'Overbonded';
      }
      return 'Inefficient';
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
  }
}

.value--success {
  color: $color-green;
}

.value--danger {
  color: $color-red;
}
</style>
