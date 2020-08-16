<template>
  <td class="favourite-node section__table__data" :class="{'favourite-node--on': starred}">
    <span class="favourite-node-toggle" @click="toggle">
      <img v-if="!starred" src="/flash-off.svg"></img>
      <img v-if="starred" src="/flash-on.svg"></img>
    </span>
    <div class="app-tooltip favourite-node-tooltip">
      Highlight this node so you can find it more easily using this browser.
    </div>
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
  computed: {
    starred() {
      return this.$store.state.nodeStarred.starredMap[this.nodeAddress];
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
  .favourite-node-toggle {
    cursor: pointer;
  }
  .favourite-node {
    border-left: 2px solid transparent;
    transition-duration: 1s;
    position: relative;

    &:hover {
      .favourite-node-tooltip {
        display: block;
      }
    }
  }
  .favourite-node--on {
    border-left: 2px solid $color-yellow;
  }
  .favourite-node-tooltip {
    position: absolute;
    right: -255px;
    top: -5px;
    background-color: $color-bg-popup;
    font-size: 12px;
    font-weight: 400;
    border-radius: 4px;
    width: 250px;
    padding: 15px;
    display: none;
  }
  .favourite-node-tooltip:before {
    content: "";
    position: absolute;
    width: 0px;
    height: 0px;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid $color-bg-popup;
    right: calc(100%);
    top: calc(50% - 6px);
  }
</style>
