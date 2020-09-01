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
      now: new Date(),
      targetTime: this.$store.getters['nodes/progressToNextChurnPoint'].targetTime,
      initialPercentage: this.$store.getters['nodes/progressToNextChurnPoint'].percentage,
      initialSecondsRemaining: this.$store.getters['nodes/progressToNextChurnPoint'].secondsRemaining,
    };
  },
  computed: {
    timeRemaining() {
      if (this.progressToNextChurnPoint.paused || !this.targetTime) {
        return 0;
      }
      return Math.round((this.targetTime - this.now) / 1000);
    },
    maxTimeRemaining() {
      return this.initialSecondsRemaining / (1 - this.initialPercentage);
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
    breakPoints() {
      return 40;
    },
    currentBreakpoint() {
      if (this.progressToNextChurnPoint.paused) {
        return 0;
      }

      return (
        Math.floor(((1 - (this.timeRemaining / this.maxTimeRemaining)) * this.breakPoints))
      );
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
  watch: {
    progressToNextChurnPoint(newP, oldP) {
      const paused = newP.paused;
      if (!paused) {
        // Only set time if target block changes as targetTime does not have second precision
        // and always setting it will result in jumps
        const shouldSetNewTime = !this.targetTime || (newP.targetBlock !== oldP.targetBlock);
        if (shouldSetNewTime) {
          this.targetTime = newP.targetTime;
          this.initialPercentage = newP.percentage;
          this.initialSecondsRemaining = newP.secondsRemaining;
        }
      }
    },
  },
  mounted() {
    this.tick();
  },
  methods: {
    breakPointAngle(bp, max) {
      // 0 is PI
      // max is 0
      const angle = Math.PI * (1 - (((bp - 1)) / (max - 1)));
      return angle;
    },
    breakPointMaxRadius(bp) {
      return bp === this.currentBreakpoint ? (this.maxRadius + 3) : this.maxRadius;
    },
    breakPointColor(bp) {
      return bp > this.currentBreakpoint ? '#fff' : '#16CEB9';
    },
    formatTime(seconds) {
      let secondsRemaining = seconds;

      const secondsPerDay = 60 * 60 * 24;
      const daysRemaining = Math.floor(secondsRemaining / secondsPerDay);
      secondsRemaining %= secondsPerDay;

      const hoursRemaining = Math.floor(secondsRemaining / 3600);
      secondsRemaining %= 3600;

      const minutesRemaining = Math.floor(secondsRemaining / 60);
      secondsRemaining %= 60;

      if (daysRemaining > 0) {
        return `${daysRemaining}d : ${hoursRemaining}h : ${minutesRemaining}m : ${secondsRemaining}s`;
      } else if (hoursRemaining > 0) {
        return `${hoursRemaining}h : ${minutesRemaining}m : ${secondsRemaining}s`;
      } else if (minutesRemaining > 0) {
        return `${minutesRemaining}m : ${secondsRemaining}s`;
      }

      return `${secondsRemaining}s`;
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
  font-size: 18px;
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
