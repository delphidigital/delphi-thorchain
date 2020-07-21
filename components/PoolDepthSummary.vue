<template>
  <div>
    <h2>Pool depth & volume</h2>
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
    <div>
      Total value locked in pools: <RuneUSD :rune="totalPoolDepth" />
    </div>
    <div>
      [Fake chart here as we don't have historical data yet]
    </div>
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
      return this.$store.getters['pools/poolVolumeAndDepth'];
    },
    totalPoolDepth() {
      return this.$store.getters['pools/totalPoolDepth'];
    },
  },
};
</script>

<style>
</style>
