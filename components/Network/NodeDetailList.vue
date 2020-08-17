<template>
  <div>
    <ActiveNodeList />
    <StandbyNodeList />
    <DisabledNodeList />
  </div>
</template>

<script>
import ActiveNodeList from './NodeDetailList/ActiveNodeList.vue';
import StandbyNodeList from './NodeDetailList/StandbyNodeList.vue';
import DisabledNodeList from './NodeDetailList/DisabledNodeList.vue';

export default {
  components: {
    ActiveNodeList,
    StandbyNodeList,
    DisabledNodeList,
  },
};
</script>

<style lang="scss">
.network-nodes-header {
  display: flex;
  align-items: center;
}

.standby-nodes-container, .active-nodes-container {
  overflow-x: scroll;
}

.jailed {
  color: $color-red;
}

.jailed-detail {
  color: $color-text-secondary;
  padding-top: 0.4rem;
  font-size: 12px;
}

.status-since-time {
  color: $color-text-secondary;
}

.network-nodes-table {
  width: 100%;
  min-width: 600px;

  .section__table__row--will-churn-in {
    .section__table__data {
      background-color: $color-green-overlay;
    }
  }

  .section__table__row--will-churn {
    .section__table__data {
      background-color: $color-red-overlay;
    }
  }

  .section__table__head {
    text-align: left;
    &--address {
      max-width: 10rem;
    }
  }

  .section__table__data--no-nodes {
    color: $color-text-secondary;
    padding: 5rem 0;
    font-size: 14px;
    letter-spacing: 1px;
    text-align: center;
  }

  .section__table--address {
    font-family: monospace;
    padding-right: 20px;
    max-width: 10rem;
    white-space: nowrap;
  }

  .active-nodes-container {
    .section__table__head {
      section__table__head--address {
        max-width: 13rem;
      }
    }
    .section__table__data {
      &--address {
        max-width: 13rem;
      }
    }
  }
}
</style>
