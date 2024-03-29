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
        <OldestActiveNodeList :show-max="viewMax" />
      </div>
      <div class="pure-u-lg-7-24 pure-u-1 section__body--active-nodes">
        <LargestStandbyNodeList :show-max="viewMax" />
      </div>
    </div>
    <div class="pure-u-1 node-summary-show-all">
      <nuxt-link
        :to="{name: 'thorchain-blockchain-network',
              params: { blockchain: currentBlockchain }}"
      >
        <span>View All Nodes</span>
        <img src="/external_link.svg"></img>
      </nuxt-link>
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
    currentBlockchain() {
      const param = this.$route.params.blockchain;
      if (param === 'testnet' || param === 'chaosnet') {
        return this.$route.params.blockchain;
      }
      return 'chaosnet';
    },
    standbyCount() {
      return this.$store.getters['nodes/totalStandbyCount'];
    },
    viewMax() {
      return 10;
    },
    totalCount() {
      return this.standbyCount + this.activeCount;
    },
    visibleCount() {
      return Math.min(this.viewMax, this.activeCount) +
        Math.min(this.viewMax, this.standbyCount);
    },
  },
};
</script>

<style lang="scss">
.nodes-header {
  display: flex;
  align-items: center;
}

.node-counts {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid $color-border;
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

.node-summary-node-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.section__body {
  &--active-nodes {
    border-left: 1px solid $color-border;
    @media screen and (max-width: $pureg-lg) {
      border-left: none;
    }
  }
}

.standby-nodes-container, .active-nodes-container {
  overflow-x: scroll;
}

.node-summary-table {
  width: 100%;
  min-width: 320px;
  td {
    height: 50px;
  }

  .section__table__head {
    text-align: left;
    section__table__head--address {
      max-width: 10rem;
    }
  }
  .section__table__data--no-nodes {
    color: $color-text-secondary;
    padding: 10rem 0;
    font-size: 14px;
    letter-spacing: 1px;
    text-align: center;
  }
  .section__table__data--address {
    font-family: monospace;
    padding-right: 20px;
    max-width: 10rem;
    white-space: nowrap;
  }

  .active-nodes-container {
    .section__table__head {
      section__table__data--address {
        max-width: 13rem;
      }
    }
    .section__table__data {
      section__table__data--address {
        max-width: 13rem;
      }
    }
  }
}

.node-summary-amount-shown {
  font-size: 12px;
  color: $color-text-secondary;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid $color-border;
  background-color: $color-bg-table-header;
  border-bottom: 1px solid $color-border;
}
</style>

<style lang="scss" scoped>
.node-summary-show-all {
  display: flex;
  width: 100%;
  // border-top: 1px solid $color-border;
  padding: 15px 25px;
  color: $color-text-secondary;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;

  a {
    width: 100%;
    display: block;
    background-color: transparent;
    border: none;
    font-size: 14px;
    color: $color-text-secondary;
    text-align: center;
  }

  img {
    height: 12px;
  }
}
</style>
