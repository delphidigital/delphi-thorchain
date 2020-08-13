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

.standby-nodes-container, .active-nodes-container {
  overflow-x: scroll;
}

.churn-status--in {
  color: $color-green;
  font-size: 0.6rem;
  font-weight: bold;
  text-transform: uppercase;
}
.churn-status--out {
  color: $color-red;
  font-size: 0.6rem;
  font-weight: bold;
  text-transform: uppercase;
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

.section__table {
  width: 100%;
  min-width: 320px;
  &__row {
    &--will-churn-in {
      .section__table__data {
        background-color: $color-green-overlay;
      }
    }
    &--will-churn {
      .section__table__data {
        background-color: $color-red-overlay;
      }
    }
  }
  &__head {
    text-align: left;
    &--address {
      max-width: 10rem;
    }
  }
  &__data {
    &--no-nodes {
      color: $color-text-secondary;
      padding: 5rem 0;
      font-size: 14px;
      letter-spacing: 1px;
      text-align: center;
    }
    &--address {
      font-family: monospace;
      padding-right: 20px;
      max-width: 10rem;
      white-space: nowrap;
    }
  }

  .active-nodes-container {
    .section__table {
      &__head {
        &--address {
          max-width: 13rem;
        }
      }
      &__data {
        &--address {
          max-width: 13rem;
        }
      }
    }
  }
}
</style>
