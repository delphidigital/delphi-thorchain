<template>
  <div class="section">
    <div class="section__header standby-pools-header">
      <h2 class="section__title">
        Standby Pools
      </h2>
      <!--
      <div class="standby-pools-gauge">
        <div
          class="standby-pools-gauge__primary"
          :style="{ width: (nextChurnHeightProgress * 100) + '%' }"
        />
      </div>
      -->
    </div>
    <div class="section__body coming-soon__parent">
      <ComingSoon />
      <table class="section__table standby-pools-table coming-soon__target">
        <thead>
          <tr>
            <th class="section__table__head">
              Name
            </th>
            <th class="section__table__head section__table__head--right">
              Amount Staked
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pool in pools" :key="pool.name" class="section__table__row">
            <td class="section__table__data section__table__data--highlight">
              {{ pool.name }}
            </td>
            <td class="section__table__data section__table__data--right">
              {{ pool.amountStaked }} RUNE
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';

export default {
  data() {
    // TODO(Fede): this is tmp dummy data for building the front end, probably not a good idea to
    // build data here
    const poolIds = this.$store.state.pools.poolIds;
    return {
      pools: poolIds.map(pid => ({
        name: pid,
        amountStaked: numeral(Math.random() * 4000000).format('0'),
      })),
      nextChurnHeightProgress: Math.random(),
    };
  },
};
</script>
<style lang="scss" scoped>
.standby-pools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.standby-pools-table {
  width: 100%;
}

.standby-pools-gauge {
  max-width: 160px;
  width: 45%;
  background-color: #2e3a59;
  height: 5px;
  border-radius: 3px;
}

.standby-pools-gauge__primary {
  height: 5px;
  border-radius: 3px;
  background-color: $color-green;
}
.coming-soon__parent {
  height: 100%;
}
</style>
