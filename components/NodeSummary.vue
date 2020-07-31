<template>
  <div class="section">
    <div class="section__header nodes-header">
      <h2 class="section__title">
        Nodes
      </h2>

      <div class="next-churn-point">
        <p>
          <time>1d 19h 24m</time> until next churn point
        </p>
        <div class="nodes-gauge">
          <div
            class="nodes-gauge__primary"
            :style="{ width: (timeRemaining * 100) + '%' }"
          />
        </div>
      </div>
    </div>
    <div class="pure-g section__body">
      <div class="pure-u-lg-6-24 pure-u-1 section__body--node-counts">
        <div class="pure-u-lg-1 active-node-count">
          <CircleStat :number="activeCount" descriptor="Active" />
        </div>
        <hr class="section__divider"></hr>
        <div class="pure-u-lg-1 standby-node-count">
          <CircleStat :number="standbyCount" descriptor="Standby" />
        </div>
      </div>
      <div class="pure-u-lg-11-24 pure-u-1 section__body--oldest-active-nodes">
        <OldestActiveNodeList />
      </div>
      <div class="pure-u-lg-7-24 pure-u-1 section__body--oldest-active-nodes">
        <LargestStandbyNodeList />
      </div>
    </div>
  </div>
</template>

<script>
import CircleStat from './NodeSummary/CircleStat.vue';
import OldestActiveNodeList from './NodeSummary/OldestActiveNodeList.vue';
import LargestStandbyNodeList from './NodeSummary/LargestStandbyNodeList.vue';

export default {
  components: {
    CircleStat,
    LargestStandbyNodeList,
    OldestActiveNodeList,
  },
  computed: {
    activeCount() {
      return this.$store.getters['nodes/totalActiveCount'];
    },
    standbyCount() {
      return this.$store.getters['nodes/totalStandbyCount'];
    },
    timeRemaining() {
      return Math.random();
    },
  },
};
</script>

<style lang="scss" scoped>
.nodes-header {
  display: flex;
  align-items: center;
}

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

.section__body {
  .active-node-count, .standby-node-count {
    height: 50%;
    display: flex;align-items: center; justify-content: center;
  }
  .active-node-count {
  }
  &--oldest-active-nodes {
    border-left: 1px solid $color-border;
    min-height: 320px;
  }
}

</style>
