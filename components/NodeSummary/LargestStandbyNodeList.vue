<template>
  <div class="standby-nodes-container">
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
            <Address :address="node['node_address']" :max-chars="maxChars" />
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
            <Address :address="node['node_address']" :max-chars="maxChars" />
          </td>
          <td class="section__table__data">
            {{ Math.round(node.bond) }}
          </td>
        </tr>
        <tr
          v-for="node in standbyNodesByBond.belowMinBond"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
          </td>
          <td class="section__table__data">
            {{ Math.round(node.bond) }}
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--out">Bond too low</span>
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
      maxChars: 16,
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
