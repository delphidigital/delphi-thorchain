<template>
  <div class="by-pool">
    <h3>By Pool</h3>
    <NetworkSolvencyByPoolChart />
  </div>
</template>

<style lang="scss" scoped>
.by-pool {
  padding: 15px 0px 20px 0px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

h3 {
  font-size: 14px;
  font-weight: 400;
  color: $color-text-secondary;
  margin-bottom: 15px;
  margin-left: 25px;
}
</style>
