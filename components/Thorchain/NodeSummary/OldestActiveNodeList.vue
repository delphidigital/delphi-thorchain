<template>
  <div class="active-nodes-container node-summary-node-list">
    <table class="section__table node-summary-table">
      <thead>
        <tr>
          <th class="section__table__head" />
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
          v-for="node in activeNodesSegmentedForChurn"
          :key="node['node_address']"
          class="section__table__row"
          :class="{'section__table__row--will-churn': node.showAsWillChurn}"
        >
          <FavouriteNodeTD :node-address="node['node_address']" />
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
          </td>
          <td class="section__table__data">
            {{ displayChurnStatus(node) }}
          </td>
          <td class="section__table__data">
            <span
              v-if="node.showAsWillChurn"
              class="churn-status churn-status--out"
            >
              May churn out
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="node-summary-amount-shown">
      showing {{ showAmount }} / {{ activeCount }}
    </div>
  </div>
</template>

<script>
import formatDistance from 'date-fns/formatDistance';
import Address from './Address.vue';
import FavouriteNodeTD from '../../Common/FavouriteNodeTD.vue';

export default {
  components: {
    Address,
    FavouriteNodeTD,
  },
  props: {
    showMax: {
      type: Number,
      default: () => 10,
    },
  },
  data() {
    return {
      formatDistance,
      maxChars: 18,
    };
  },
  computed: {
    activeNodesSegmentedForChurn() {
      const allNodes = this.$store.getters['nodes/activeNodesSegmentedForChurn'];
      return allNodes.slice(0, this.showMax);
    },
    showAmount() {
      return Math.min(this.activeNodesSegmentedForChurn.length, this.showMax);
    },
    activeCount() {
      return this.$store.getters['nodes/totalActiveCount'];
    },
    currentDate() {
      return new Date();
    },
  },
  methods: {
    displayChurnStatus(node) {
      console.log(node.churnStatusType);
      switch (node.churnStatusType) {
        case 'forcedToLeave':
          return 'forced to leave';
        case 'requestedToLeave':
          return 'requested to leave';
        case 'markedToLeave':
          return `marked to leave on block ${node['leave_height']}`;
        case 'oldest':
          return 'Oldest Node';
        case 'badNode':
          return 'Has bad behavior score';
        case 'lowVersion':
          return 'Has outdated software version';
        default:
          return `active since ${node['status_since']}`;
      }
    },
  },
};
</script>
