<template>
  <div>
    <div class="section">
      <div class="section__header network-nodes-header">
        <h2 class="section__title">
          Active Nodes
        </h2>
        <div class="section__title__note section__title__node--behavior">
          <span>Bad behaviour threshold: {{ badBehaviourThreshold }}</span>

          <div class="bad-behavior-tooltip">
            <div class="app-tooltip">
              <div class="app-tooltip__body">
                Behaviour score is calculated by dividing the age of the node by the
                slash points. A high score is good and a low score is bad.
                Nodes are churned out for bad behaviour if their score is less than
                1/3 of the average score, or if it has the worst score if all are
                above that value.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="section__body">
        <div class="active-nodes-container">
          <table class="section__table network-nodes-table">
            <thead>
              <tr>
                <th class="section__table__head section__table__head--star" />
                <th class="section__table__head section__table__head--address">
                  Address
                </th>
                <th class="section__table__head section__table__head--location">
                  Location
                </th>
                <th class="section__table__head section__table__head--version">
                  Version
                </th>
                <th class="section__table__head section__table__head--location">
                  Behavior Score
                </th>
                <th class="section__table__head section__table__head--status">
                  Status
                </th>
                <th class="section__table__head section__table__head--bond">
                  Bond
                </th>
                <th class="section__table__head section__table__head--status-since">
                  Status Since
                </th>
              </tr>
            </thead>
            <ActiveNodeRows
              :nodes="activeNodesSegmentedForChurn"
            />
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ActiveNodeRows from './ActiveNodeRows.vue';

export default {
  components: {
    ActiveNodeRows,
  },
  computed: {
    activeNodesSegmentedForChurn() {
      return this.$store.getters['nodes/activeNodesSegmentedForChurnAndThreshold'].activeNodes;
    },
    badBehaviourThreshold() {
      return Math.floor(this.$store.getters['nodes/activeNodesSegmentedForChurnAndThreshold'].threshold);
    },
  },
};
</script>
