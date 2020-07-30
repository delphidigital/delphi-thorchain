<template>
  <div>
    <div class="section__header">
      <h2 class="section__title">
        Nodes
      </h2>
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
  },
};
</script>

<style lang="scss" scoped>
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
