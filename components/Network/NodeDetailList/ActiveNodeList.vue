<template>
  <div>
    <div class="section">
      <div class="section__header network-nodes-header">
        <h2 class="section__title">
          Active Nodes
        </h2>
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
      return this.$store.getters['nodes/activeNodesSegmentedForChurn'];
    },
  },
};
</script>
