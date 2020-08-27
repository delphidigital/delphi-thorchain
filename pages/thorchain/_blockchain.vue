<template>
  <nuxt-child />
</template>

<script>
export default {
  validate({ params }) {
    return params.blockchain === 'testnet' || params.blockchain === 'chaosnet';
  },
};
</script>
