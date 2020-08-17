<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Node Status
      </h2>
    </div>
    <div class="section__body node-status">
      <NodeStatusPieChart :chart-data="pieChartData" />
      <NodeStatusTable :table-data="nodeStatusData" />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    nodeStatusData() {
      const countsByStatus = this.$store.getters['nodes/countsByStatus'];
      const statusDisplay = [
        {
          status: 'Active',
          key: 'active',
          color: '#16CEB9',
        },
        {
          status: 'Standby',
          key: 'standby',
          color: '#2D99FF',
        },
        {
          status: 'Ready',
          key: 'ready',
          color: '#5E2BBC',
        },
        {
          status: 'Disabled',
          key: 'disabled',
          color: '#3F4357',
        },
      ].map((statusDisplayItem) => {
        const value = countsByStatus[statusDisplayItem.key] || 0;
        return {
          ...statusDisplayItem,
          value,
        };
      });

      return statusDisplay;
    },
    pieChartData() {
      return this.nodeStatusData.map(statusDisplayItem => (
        {
          name: statusDisplayItem.status,
          y: statusDisplayItem.value,
          color: statusDisplayItem.color,
        }
      ));
    },
  },
};
</script>

<style lang="scss" scoped>
.node-status {
  padding: 30px 25px;
}
</style>
