<template>
  <td class="section__table__data section__table__data--favourite">
    <span @click="toggle">
      <img v-if="!favourited" src="/flash-off.svg"></img>
      <img v-if="favourited" src="/flash-on.svg"></img>
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
  computed: {
    favourited() {

    },
  },
  methods: {
    toggle() {
    },
  },  
};
</script>
