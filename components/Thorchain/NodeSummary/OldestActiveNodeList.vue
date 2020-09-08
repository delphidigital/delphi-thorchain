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
          v-for="node in activeNodesSegmentedForChurn.forcedToLeave"
          :key="node['node_address']"
          class="section__table__row section__table__row--will-churn"
        >
          <FavouriteNodeTD :node-address="node['node_address']" />
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
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
          <FavouriteNodeTD :node-address="node['node_address']" />
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
          </td>
          <td class="section__table__data">
            requested to leave
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
          <FavouriteNodeTD :node-address="node['node_address']" />
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
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
          <FavouriteNodeTD :node-address="node['node_address']" />
          <td class="section__table__data section__table__data--address">
            <Address :address="node['node_address']" :max-chars="maxChars" />
          </td>
          <td class="section__table__data">
            active since {{ node['status_since'] }}
          </td>
          <td class="section__table__data" />
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
      return this.matchNodesToQuota.nodes;
    },
    showAmount() {
      return this.matchNodesToQuota.count;
    },
    activeCount() {
      return this.$store.getters['nodes/totalActiveCount'];
    },
    matchNodesToQuota() {
      const allNodes = this.$store.getters['nodes/activeNodesSegmentedForChurn'];
      const keys = [
        'forcedToLeave',
        'requestedToLeave',
        'oldestValidators',
        'otherValidatorsByAge',
      ];

      let quota = this.showMax;
      const result = {};
      keys.forEach((k) => { result[k] = []; });

      for (let i = 0; i < keys.length && quota > 0; i += 1) {
        const targetNodes = allNodes[keys[i]] || [];
        const amountToGet = targetNodes.length > quota ? quota : targetNodes.length;

        result[keys[i]] = targetNodes.slice(0, amountToGet);
        quota -= amountToGet;
      }
      return { nodes: result, count: this.showMax - quota };
    },
    currentDate() {
      return new Date();
    },
  },
};
</script>
