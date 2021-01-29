<template>
  <table class="table">
    <thead class="table__head">
      <tr>
        <th>Name</th>
        <th>Volume</th>
        <th>Depth</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" :key="item.poolId" class="table__row">
        <td class="table__highlight">
          <span class="marker" :style="{backgroundColor: item.color}" />{{ item.poolId }}
        </td>
        <td class="table__data">
          <RuneUSD :rune="item.totalVolume" />
        </td>
        <td class="table__data">
          <RuneUSD :rune="item.depthAverage" />
        </td>
      </tr>
      <tr class="table__row">
        <td class="table__highlight">
          <span class="marker" :style="{backgroundColor: aggregate.color}" />{{ aggregate.poolId }}
        </td>
        <td class="table__data">
          <RuneUSD :rune="aggregate.totalVolume" />
        </td>
        <td class="table__data">
          <RuneUSD :rune="aggregate.depthAverage" />
        </td>
      </tr>
      <tr class="table__footer">
        <td colspan="2" class="table__highlight">
          Total value locked in pools:
        </td>
        <td class="table__highlight">
          <RuneUSD :rune="totalPoolsDepth" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import RuneUSD from '../Common/RuneUSD.vue';

export default {
  components: {
    RuneUSD,
  },
  computed: {
    poolDepthAndVolume() {
      return this.$store.getters['pools/poolDepthAndVolume'];
    },
    data() {
      return this.poolDepthAndVolume.filter(d => d.poolId !== 'Other');
    },
    aggregate() {
      return this.poolDepthAndVolume.find(d => d.poolId === 'Other');
    },
    totalPoolsDepth() {
      return this.$store.getters['pools/totalPoolsDepth'];
    },
  },
};
</script>

<style lang="scss" scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 25px;
}

.table__head {
  text-transform: uppercase;
  text-align: left;
  font-size: 11px;
  color: $color-text-secondary;
  border-bottom: 1px solid $color-border;
  th {
    padding-bottom: 7px;
  }
}

.table__row {
  font-size: 14px;
  td {
    padding: 7px 0;
  }
}

.table__highlight {
  font-weight: 600;
}

.table__data {
  font-weight: 400;
}

.table__footer {
  font-size: 14px;
  border-top: 1px solid $color-border;
  td {
    padding-top: 14px;
  }
}

.marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
</style>
