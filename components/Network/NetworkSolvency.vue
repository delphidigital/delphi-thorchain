<template>
  <div class="section solvency">
    <div class="section__header">
      <h2 class="section__title">
        Solvency
      </h2>
    </div>
    <div class="section__body solvency-body">
      <div class="overall-container">
        <NetworkSolvencyOverall />
      </div>
      <div class="by-pool-container">
        <NetworkSolvencyByPool />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.solvency {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.solvency-body {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.overall-container {
  border-right: 1px solid $color-border;
}

.by-pool-container {
  flex-grow: 1;
}
</style>
