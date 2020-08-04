<template>
  <div class="active-nodes-container">
    <table class="section__table">
      <thead>
        <tr>
          <th class="section__table__head section__table__head--address">
            Active validators
          </th>
          <th class="section__table__head">
            Churn status
          </th>
          <th class="section__table__head" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="node in activeNodesSegmentedForChurn.forcedToLeave"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            forced to leave
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--out">Will churn out</span>
          </td>
        </tr>
        <tr
          v-for="node in activeNodesSegmentedForChurn.requestedToLeave"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            requested to leave
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--out">Will churn out</span>
          </td>
        </tr>
        <tr
          v-for="node in activeNodesSegmentedForChurn.scheduledToLeave"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            scheduled to leave at block {{ node['leave_height'] }}
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--out">Will churn out</span>
          </td>
        </tr>
        <tr
          v-for="node in activeNodesSegmentedForChurn.oldestValidators"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            will churn due to age
          </td>
          <td class="section__table__data">
            <span class="churn-status churn-status--out">Will churn out</span>
          </td>
        </tr>
        <tr
          v-for="node in activeNodesSegmentedForChurn.otherValidatorsByAge"
          :key="node['node_address']"
          class="section__table__row"
        >
          <td class="section__table__data section__table__data--address">
            {{ node['node_address'] }}
          </td>
          <td class="section__table__data">
            active since {{ node['status_since'] }}
          </td>
          <td class="section__table__data" />
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
    activeNodesSegmentedForChurn() {
      return this.$store.getters['nodes/activeNodesSegmentedForChurn'];
    },
    currentDate() {
      return new Date();
    },
  },
};
</script>
