<template>
  <div class="section solvency">
    <div class="section__header">
      <h2 class="section__title">
        Solvency
      </h2>
    </div>
    <div class="section__body coming-soon__parent">
      <ComingSoon />
      <div class="coming-soon__target solvency-body">
        <div class="overall-container">
          <NetworkSolvencyOverall />
        </div>
        <div class="by-pool-container">
          <NetworkSolvencyByPool />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ComingSoon from '../Common/ComingSoon.vue';

export default {
  components: {
    ComingSoon,
  },
};
</script>

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

  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
}

.overall-container {
  border-right: 1px solid $color-border;

  @media screen and (max-width: 600px) {
    border-right: none;
  }
}

.by-pool-container {
  flex-grow: 1;
}
</style>
