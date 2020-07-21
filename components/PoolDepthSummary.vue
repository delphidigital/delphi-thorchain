<template>
  <div>
    <div>
      * Fede: note the absolute numbers are here
      are still in RUNE but need to be converted to USD
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Volume</th>
          <th>Depth</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in poolVolumeAndDepth" :key="item.poolId">
          <td>{{ item.poolId }}</td>
          <td>
            <RuneUSD :rune="item.poolVolume" />
            (normalised: {{ item.normPoolVolume }})
          </td>
          <td>
            <RuneUSD :rune="item.poolDepth" />
            (normalised {{ item.normPoolDepth }})
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import RuneUSD from './RuneUSD.vue';

export default {
  components: {
    RuneUSD,
  },
  computed: {
    poolVolumeAndDepth() {
      console.log(this.$store.getters);
      return this.$store.getters['pools/poolVolumeAndDepth'];
    },
  },
};
</script>

<style>
</style>
