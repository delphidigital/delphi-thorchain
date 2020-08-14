<template>
  <td :class="`section__table__data section__table__data--starred ${tdClass()}`">
    <span class="toggle" @click="toggle">
      <img v-if="!starred" src="/flash-off.svg"></img>
      <img v-if="starred" src="/flash-on.svg"></img>
    </span>
  </td>
</template>

<script>
export default {
  props: {
    nodeAddress: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      tdClass() {
        return this.starred ? 'section__table__data--starred--on' : '';
      },
    };
  },
  computed: {
    starred() {
      // return this.$store.state.nodeStarred.starredMap[this.nodeAddress];
      return false;
    },
  },
  methods: {
    toggle() {
      this.$store.commit('nodeStarred/toggle', this.nodeAddress);
    },
  },
};
</script>

<style scoped lang="scss">
  .toggle {
    cursor: pointer;
  }
  .section__table__data--starred {
    border-left: 2px solid transparent;
    transition-duration: 1s;
  }
  .section__table__data--starred--on {
    border-left: 2px solid $color-yellow;
  }
</style>
