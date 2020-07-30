<template>
  <div>
    <table class="section__table">
      <thead>
        <tr>
          <th class="section__table__head section__table__head--address">
            Standby validators
          </th>
          <th class="section__table__head">
            Bond
          </th>
          <th class="section__table__head" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="node in standbyNodesByBond.toChurnIn"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn-in"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            {{ Math.round(node.bond) }}
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--in">Will churn in</span>
          </td>
        </tr>
        <tr
          v-for="node in standbyNodesByBond.otherValidatorsByBond"
          :key="node['node_address']"
          class="section__table__row"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            {{ Math.round(node.bond) }}
          </td>
        </tr>
      </tbody>
    </table>
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
    standbyNodesByBond() {
      return this.$store.getters['nodes/standbyNodesByBond'];
    },
    currentDate() {
      return new Date();
    },
  },
};
</script>

<style lang="scss" scoped>
  .churn-status--in {
    color: $color-green;
    font-size: 0.6rem;
    font-weight: bold;
    text-transform: uppercase;
  }
  .section__table {
    width: 100%;
    &__row {
      &--will-churn-in {
        .section__table__data {
          background-color: $color-green-overlay;
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
      &--address {
        padding-right: 20px;
        max-width: 10rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
</style>
