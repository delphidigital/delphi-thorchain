<template>
  <table class="table">
    <tbody>
      <tr v-for="item in tableData" :key="item.name">
        <td><span :style="{borderColor: item.color}" class="marker" />{{ item.status }}</td>
        <td class="table__data">
          {{ item.value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style lang="scss" scoped>
.table {
  margin-top: 20px;
  font-weight: 400;
  font-size: 14px;
  width: 100%;
  td {
    padding: 7px 0;
  }

}

.table__data {
  text-align: right;
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
