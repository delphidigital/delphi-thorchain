<template>
  <table class="table">
    <tbody>
      <tr v-for="item in data" :key="item.name">
        <td><span :style="{borderColor: item.color}" class="marker" />{{ item.name }}</td>
        <td class="table__percentage">
          <Percentage :value="item.percentage" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import Percentage from './../Common/Percentage.vue';

export default {
  components: {
    Percentage,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style lang="scss" scoped>
.table {
  margin-top: 55px;
  font-weight: 400;
  font-size: 14px;
  width: 100%;
  td {
    padding: 7px 0;
  }

}

.table__percentage {
  @media screen and (max-width: $pureg-lg) {
    text-align: right;
  }
}

.marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid;
  display: inline-block;
  margin-right: 6px;
}
</style>
