<!-- eslint-disable -->
<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Churn info
      </h2>
    </div>
    <div class="section__body churn-info">
      <div class="countdown__gauge">
        <svg height="125" width="240">
          <line
            v-for="n in breakPoints"
            :key="n"
            :x1="gaugeWidth / 2 + minRadius * Math.cos(breakPointAngle(n, breakPoints))"
            :x2="gaugeWidth / 2 + breakPointMaxRadius(n) * Math.cos(breakPointAngle(n, breakPoints))"
            :y1="(gaugeHeight - 2) - minRadius * Math.sin(breakPointAngle(n, breakPoints))"
            :y2="(gaugeHeight - 2) - breakPointMaxRadius(n) * Math.sin(breakPointAngle(n, breakPoints))"
            :stroke="breakPointColor(n)"
            :stroke-width="n === currentBreakpoint ? 3 : 1"
          />
        </svg>
        <p class="countdown__gauge__text">
          <span class="countdown__gauge__time">
            {{ formatTime(timeRemaining) }}
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

      <p class="rotates-legend text__label">
        *Rotates every 240 blocks or 15 minutes
      </p>
    </div>
  </div>
</template>

<script>
const seconds = 1000;
const minutes = 60 * seconds;

export default {
  data() {
    return {
      timeRemaining: 1 * minutes,
    };
  },
  computed: {
    minRadius() {
      return 105;
    },
    maxRadius() {
      return 120;
    },
    gaugeWidth() {
      return 240;
    },
    gaugeHeight() {
      return 125;
    },
    maxTime() {
      return 15 * minutes;
    },
    breakPoints() {
      return 40;
    },
    currentBreakpoint() {
      // TODO(Fede): Do this dynamically based on time remaining
      return (
        this.breakPoints - Math.ceil((this.timeRemaining / this.maxTime) * this.breakPoints)
      ) + 1;
    },
  },
  mounted() {
    this.tick();
  },
  methods: {
    breakPointAngle(bp, max) {
      const angle = (Math.PI * (bp - 1)) / (max - 1);
      return angle;
    },
    breakPointMaxRadius(bp) {
      return bp === this.currentBreakpoint ? (this.maxRadius + 3) : this.maxRadius;
    },
    breakPointColor(bp) {
      return bp < this.currentBreakpoint ? '#fff' : '#16CEB9';
    },
    formatTime(milliseconds) {
      const minsRemaining = Math.floor(milliseconds / minutes);
      const secondsRemaining = milliseconds % minutes;

      return `${minsRemaining}m : ${secondsRemaining / 1000}s`;
    },
    tick() {
      setInterval(() => {
        this.timeRemaining -= 1 * seconds;
        if (this.timeRemaining < 0) {
          this.timeRemaining = this.maxTime;
        }
      }, 1 * seconds);
    },
  },
};
</script>

<style lang="scss" scoped>
.churn-info {
  padding: 0 25px;
  display: flex;
  flex-direction: column;
  height: 300px;
  align-items: flex-start;
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
  bottom: 32px;
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
  margin-top: 5px;
  border-radius: 8px;
}

.next-churn-height__value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.rotates-legend {
  width: 100%;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 25px;
}
</style>
