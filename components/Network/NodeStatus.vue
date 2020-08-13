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
      return [
        {
          status: 'Active',
          value: 22,
          color: '#16CEB9',
        },
        {
          status: 'Standby',
          value: 2,
          color: '#2D99FF',
        },
        {
          status: 'Ready',
          value: 3,
          color: '#5E2BBC',
        },
        {
          status: 'Disabled',
          value: 5,
          color: '#3F4357',
        },
      ];
    },
    pieChartData() {
      return this.nodeStatusData.map(nsd => ({
        name: nsd.status,
        y: nsd.value,
        color: nsd.color,
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
.node-status {
  padding: 30px 25px;
}
</style>
