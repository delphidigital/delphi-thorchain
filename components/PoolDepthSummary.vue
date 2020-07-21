<template>
  <div>
    <ul>
      <li v-for="item in $store.state.pools.poolIds" :key="item">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>
