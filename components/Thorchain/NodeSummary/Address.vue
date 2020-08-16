<template>
  <span>
    {{ truncatedAddress }}
  </span>
</template>

<script>
const endPortionChars = 4;
export default {
  props: {
    address: {
      type: String,
      default: '',
    },
    maxChars: {
      type: Number,
      default: 20,
    },
  },
  computed: {
    truncatedAddress() {
      if (this.maxChars >= 43) return this.address;
      const startPortionChars = this.maxChars - endPortionChars - 3;
      const startPortion = this.address.slice(0, startPortionChars - 1);
      const endPortion = this.address.slice(this.address.length - endPortionChars);
      return `${startPortion}…${endPortion}`;
    },
  },
};
</script>

<style>
</style>
