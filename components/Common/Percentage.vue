<template>
  <span>
    {{ percentage }}%
  </span>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    percentage() {
      return (this.value * 100).toFixed(2);
    },
  },
};
</script>

<style>
</style>
