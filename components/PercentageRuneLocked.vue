<template>
  <div>
    <h2>Percentage RUNE locked</h2>
    <table>
      <tbody>
        <tr>
          <td>Pools</td>
          <td>
            <Percentage :value="poolPercentage" />
          </td>
        </tr>
        <tr>
          <td>Active nodes</td>
          <td>
            <Percentage :value="activeNodePercentage" />
          </td>
        </tr>
        <tr>
          <td>Standby nodes</td>
          <td>
            <Percentage :value="standbyNodePercentage" />
          </td>
        </tr>
        <tr>
          <td>Standby pools</td>
          <td>
            0
          </td>
        </tr>
        <tr>
          <td>Unlocked</td>
          <td>
            <Percentage :value="unlockedPercentage" />
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      [Fake chart here as we don't have historical data yet]
    </div>
  </div>
</template>

<script>
import Percentage from './Percentage.vue';

export default {
  components: {
    Percentage,
  },
  computed: {
    poolPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      return totalRuneDepth / circulatingSupply;
    },
    activeNodePercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      return totalActiveBonded / circulatingSupply;
    },
    standbyNodePercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      return totalStandbyBonded / circulatingSupply;
    },
    unlockedPercentage() {
      const circulatingSupply = this.$store.state.runeMarketData.circulatingSupply;
      const totalStandbyBonded = this.$store.getters['nodes/totalStandbyBonded'];
      const totalActiveBonded = this.$store.getters['nodes/totalActiveBonded'];
      const totalRuneDepth = this.$store.getters['pools/totalRuneDepth'];
      const totalLocked = totalRuneDepth + totalActiveBonded + totalStandbyBonded;
      const totalUnlocked = circulatingSupply - totalLocked;
      return totalUnlocked / circulatingSupply;
    },
  },
};
</script>

<style>
</style>
