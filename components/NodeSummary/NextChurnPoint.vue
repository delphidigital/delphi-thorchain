<template>
  <div class="next-churn-point">
    <p>
      <time>
        {{ formatDistance(0, progressToNextChurnPoint.secondsRemaining * 1000) }}
      </time> until next churn point
    </p>
    <div class="nodes-gauge">
      <div
        class="nodes-gauge__primary"
        :style="{ width: (progressToNextChurnPoint.percentage * 100) + '%' }"
      />
    </div>
  </div>
</template>

<script>
import formatDistance from 'date-fns/formatDistance';

export default {
  data() {
    return {
      formatDistance,
    };
  },
  computed: {
    progressToNextChurnPoint() {
      return this.$store.getters['nodes/progressToNextChurnPoint'];
    },
  },
};
</script>

<style lang="scss" scoped>
.next-churn-point {
  margin-left: 20px;

  p {
    font-size: 12px;
    font-weight: 500;
    color: $color-text-secondary;
    margin-bottom: 5px;
  }

  time {
    color: $color-green;
    font-weight: 600;
  }
}

.nodes-gauge {
  width: 100%;
  background-color: #2e3a59;
  height: 5px;
  border-radius: 3px;
}

.nodes-gauge__primary {
  height: 5px;
  border-radius: 3px;
  background-color: $color-green;
}
</style>
