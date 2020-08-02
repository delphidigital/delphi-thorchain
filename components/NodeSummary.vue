<template>
  <div class="section">
    <div class="section__header nodes-header">
      <h2 class="section__title">
        Nodes
      </h2>
      <NextChurnPoint />
    </div>
    <div class="pure-g section__body">
      <div class="pure-u-lg-6-24 pure-u-1 node-counts">
        <div class="node-count node-count--first">
          <CircleStat :number="activeCount" descriptor="Active" />
        </div>
        <div class="node-count">
          <CircleStat :number="standbyCount" descriptor="Standby" />
        </div>
      </div>
      <div class="pure-u-lg-11-24 pure-u-1 section__body--active-nodes">
        <OldestActiveNodeList />
      </div>
      <div class="pure-u-lg-7-24 pure-u-1 section__body--active-nodes">
        <LargestStandbyNodeList />
      </div>
    </div>
  </div>
</template>

<script>
import CircleStat from './NodeSummary/CircleStat.vue';
import OldestActiveNodeList from './NodeSummary/OldestActiveNodeList.vue';
import LargestStandbyNodeList from './NodeSummary/LargestStandbyNodeList.vue';
import NextChurnPoint from './NodeSummary/NextChurnPoint.vue';

export default {
  components: {
    CircleStat,
    LargestStandbyNodeList,
    OldestActiveNodeList,
    NextChurnPoint,
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

.node-counts {
  display: flex;
  flex-direction: column;
  @media screen and (max-width: $pureg-lg) {
    flex-direction: row;
    width: 100%;
  }
}

.node-count {
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  @media screen and (max-width: $pureg-lg) {
    height: 100%;
    width: 50%;
  }
}

.node-count--first {
  border-bottom: 1px solid $color-border;
  @media screen and (max-width: $pureg-lg) {
    border-bottom: none;
    border-right: 1px solid $color-border;
  }
}

.section__body {
  &--active-nodes {
    border-left: 1px solid $color-border;
    @media screen and (max-width: $pureg-lg) {
      border-left: none;
    }
  }
}


</style>
