<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">
        Latest blocks
      </h2>
    </div>
    <div class="section__body">
      <div class="latest-blocks">
        <div v-for="block in latestBlocks" :key="block.name" class="latest-block">
          <p class="latest__value">
            {{ block.value }}
          </p>
          <p class="text__label">
            {{ block.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';

function formatValue(value) {
  return numeral(value).format('0,0');
}

export default {
  computed: {
    latestBlocks() {
      return [
        {
          name: 'Thorchain',
          value: formatValue(this.$store.state.networkHealth.lastThorchainBlock),
        },
        {
          name: 'Binance',
          value: formatValue(this.$store.state.networkHealth.lastBinanceBlock),
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.latest-blocks {
  display: flex;
  justify-content: space-between;
  padding: 20px 25px;
  height: 105px;
  max-width: 300px;
  margin: 0 auto;
}

.latest-block {
  background-color: $color-bg-table-header;
  width: 95px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 12px 0;
}

.latest__value {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}
</style>
