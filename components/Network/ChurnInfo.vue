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

        <p v-if="progressToNextChurnPoint.retiring" class="countdown__gauge__text">
          <span class="countdown__gauge__time">
            <img src="/rings.svg"></img>
          </span>
          <span class="text__label">
            churning in progress
          </span>
        </p>
        <p v-else-if="progressToNextChurnPoint.noEligible" class="countdown__gauge__text">
          <span class="countdown__gauge__time">
            <img src="/pause.svg"></img>
          </span>
          <span class="text__label">
            churning is paused
          </span>
        </p>
        <p v-else class="countdown__gauge__text">
          <time class="countdown__gauge__time">
            {{ formatTime(timeRemaining) }}
          </time>
          <span class="text__label">
            time remaining
          </span>
        </p>
      </div>


      <div class="next-churn-height">
        <span class="next-churn-height__value">
          {{ nextChurnHeight }} 
        </span>
        <span class="text__label">
          Next churn height{{ progressToNextChurnPoint.paused ? ': unknown' : ' *' }}
        </span>
      </div>

      <p v-if="!progressToNextChurnPoint.paused" class="rotates-legend text__label">
      *Rotates every {{ rotatePerBlockHeight }} blocks or {{ rotatePerMinutes }} minutes
      </p>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      // TODO(Fede): Maybe this belongs to a store so we have global access
      now: new Date(),
    };
  },
  computed: {
    timeRemaining() {
      if (this.progressToNextChurnPoint.paused) {
        return 0;
      }
      const diff = Math.floor((this.now - this.progressToNextChurnPoint.updatedAt) / 1000);
      return this.progressToNextChurnPoint.secondsRemaining - diff;
    },
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
      // NOTE(Fede): This would use
      // (rotatePerBlockHeight || oldValidatorRate) * secondsPerBlock
      if (this.progressToNextChurnPoint.paused) {
        // NOTE(Fede): does not really matter for now
        return 2;
      }
      return Math.round(
        this.progressToNextChurnPoint.secondsRemaining / this.progressToNextChurnPoint.percentage);
    },
    breakPoints() {
      return 40;
    },
    currentBreakpoint() {
      return (
        this.breakPoints - Math.ceil((this.timeRemaining / this.maxTime) * this.breakPoints)
      ) + 1;
    },
    progressToNextChurnPoint() {
      return this.$store.getters['nodes/progressToNextChurnPoint'];
    },
    nextChurnHeight() {
      if (this.progressToNextChurnPoint.retiring) {
        return 'Vault is retiring';
      } else if (this.progressToNextChurnPoint.noEligible) {
        return 'No eligible nodes';
      }
      return this.$store.state.nodes.nextChurnHeight;
    },
    rotatePerBlockHeight() {
      return this.$store.state.nodes.rotatePerBlockHeight;
    },
    rotatePerMinutes() {
      const seconds = this.$store.state.nodes.secondsPerBlock;
      return Math.round((seconds * this.rotatePerBlockHeight) / 60);
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
    formatTime(seconds) {
      const minsRemaining = Math.floor(seconds / 60);
      const secondsRemaining = seconds % 60;

      return `${minsRemaining}m : ${secondsRemaining}s`;
    },
    tick() {
      setInterval(() => {
        this.now = new Date();
      }, 1000);
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
