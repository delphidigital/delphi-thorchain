<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Churn info
      </h2>
    </div>
    <div class="section__body churn-info">
      <div class="countdown__gauge">
        <svg height="120" width="230">
          <line
            v-for="n in 40"
            :key="n"
            :x1="gaugeWidth / 2 + minRadius * Math.cos(breakPointAngle(n, 40))"
            :x2="gaugeWidth / 2 + breakPointMaxRadius(n) * Math.cos(breakPointAngle(n, 40))"
            :y1="gaugeHeight - minRadius * Math.sin(breakPointAngle(n, 40))"
            :y2="gaugeHeight - breakPointMaxRadius(n) * Math.sin(breakPointAngle(n, 40))"
            :stroke="breakPointColor(n)"
            :stroke-width="n === currentBreakpoint ? 3 : 1"
          />
        </svg>
        <p class="countdown__gauge__text">
          <span class="countdown__gauge__time">
            10m : 20s
          </span>
          <span class="text__label">
            time remaining
          </span>
        </p>
      </div>

      <div class="next-churn-height">
        <span class="next-churn-height__value">
          15,825
        </span>
        <span class="text__label">
          Next churn height
        </span>
      </div>
    </div>

    <p class="rotates-legend text__label">
      *Rotates every 240 blocks or 15 minutes
    </p>
  </div>
</template>

<script>
export default {
  computed: {
    minRadius() {
      return 98;
    },
    maxRadius() {
      return 110;
    },
    gaugeWidth() {
      return 230;
    },
    gaugeHeight() {
      return 120;
    },
    currentBreakpoint() {
      // TODO(Fede): Do this dynamically based on time remaining
      return 20;
    },
  },
  methods: {
    breakPointAngle(bp, max) {
      return (Math.PI * (bp - 1)) / (max - 1);
    },
    breakPointMaxRadius(bp) {
      return bp === this.currentBreakpoint ? (this.maxRadius + 3) : this.maxRadius;
    },
    breakPointColor(bp) {
      return bp < this.currentBreakpoint ? '#fff' : '#16CEB9';
    },
  },
};
</script>

<style lang="scss" scoped>
.churn-info {
  padding: 0 25px;
}
.countdown__gauge {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 25px 0;
  position: relative;
}

.countdown__gauge__text {
  position: absolute;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  text-align: center;
  bottom: 30px;
}

.countdown__gauge__time {
  font-size: 21px;
  font-weight: 600;
}

.next-churn-height {
  width: 100%;
  background-color: $color-bg-table-header;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px 0;
  border-radius: 8px;
}

.next-churn-height__value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.rotates-legend {
  width: 100%;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 25px;
}
</style>
