<template>
  <div class="standby-nodes-container node-summary-node-list">
    <table class="section__table node-summary-table">
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
            <span class="churn-status churn-status--in">may churn in</span>
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
          <td class="section__table__data" />
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
        <tr
          v-for="node in standbyNodesByBond.withPreflightStatusIssue"
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
            <span class="churn-status churn-status--out">
              {{JSON.stringify(node, null, 2)}}
            </span>
          </td>
        </tr>
        <tr v-if="emptyList">
          <td colspan="3" class="section__table__data--no-nodes">
            No eligible standby nodes
          </td>
        </tr>
      </tbody>
    </table>
    <div class="node-summary-amount-shown">
      showing {{ showAmount }} / {{ standbyCount }}
    </div>
  </div>
</template>

<script>
import formatDistance from 'date-fns/formatDistance';

export default {
  props: {
    showMax: {
      type: Number,
      default: () => 10,
    },
  },
  data() {
    return {
      formatDistance,
      maxChars: 16,
    };
  },
  computed: {
    emptyList() {
      return this.$store.getters['nodes/totalStandbyCount'] === 0;
    },
    standbyNodesByBond() {
      return this.matchNodesToQuota.nodes;
    },
    showAmount() {
      return this.matchNodesToQuota.count;
    },
    standbyCount() {
      return this.$store.getters['nodes/totalStandbyCount'];
    },
    matchNodesToQuota() {
      const allNodes = this.$store.getters['nodes/standbyNodesByBond'];

      const keys = [
        'toChurnIn',
        'otherValidatorsByBond',
        'belowMinBond',
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
