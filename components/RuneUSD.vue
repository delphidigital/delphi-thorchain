<template>
  <span>
    {{ usd }}
  </span>
</template>

<script>
import numeral from 'numeral';

export default {
  props: {
    rune: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    usd() {
      const priceUSD = this.$store.state.runeMarketData.priceUSD;
      return numeral(this.rune * priceUSD).format('($0,00a)').toUpperCase();
    },
  },
};
</script>

<style>
</style>
