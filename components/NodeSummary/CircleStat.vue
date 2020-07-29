<template>
  <div class="circle-stat">
    <span class="circle-stat--number">{{ number }}</span>
    <span class="circle-stat--descriptor">{{ descriptor }}</span>
  </div>
</template>

<script>
export default {
  props: {
    number: {
      type: Number,
      default: 0,
    },
    descriptor: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
  .circle-stat {
    border: 4px solid $color-border;
    border-radius: 50%;
    position: relative;
    height: 140px;
    width: 140px;

    &--number {
      display: block;
      font-size: 1.4rem;
      font-weight: bold;
      margin-top: 30%;
      text-align: center;
      top: 40%;
      width: 100%;
    }
    &--descriptor {
      display: block;
      font-size: 0.8rem;
      margin-top: 0.3rem;
      text-align: center;
      top: 60%;
      width: 100%;
    }
  }
</style>
