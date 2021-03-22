<template>
  <div class="overall">
    <h3>Overall</h3>
    <div class="solvencies">
      <div v-for="solvency in solvencies" :key="solvency.name" class="solvency">
        <div>
          <h4>{{ solvency.name }}</h4>
          <p v-if="solvency.solvency >= 0.5" class="solvency-value solvency-value--success">
            Solvent
          </p>
          <p v-else class="solvency-value solvency-value--danger">
            Insolvent
          </p>
        </div>
        <NetworkSolvencyPieChart :solvency="solvency.solvency" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    solvencies() {
      return [
        {
          name: 'RUNE',
          solvency: Number(this.$store.getters['vaultBalances/solvency'].rune.toFixed(2)),

        },
        {
          name: 'Other',
          solvency: Number(this.$store.getters['vaultBalances/solvency'].other.toFixed(2)),
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.overall {
  padding: 15px 25px 20px 25px;
  display: flex;
  flex-direction: row;
  height: 100%;
}

h3 {
  font-size: 14px;
  font-weight: 600;
  color: $color-text-secondary;
  margin-bottom: 15px;
  display: flex;
  flex: 1;
  align-items: center;
}

h4 {
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 12px;
}

.solvencies {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.solvency {
  padding: 12px 15px;
  background-color: $color-bg-table-header;
  border-radius: 8px;
  display: flex;
  width: 190px;
  justify-content: space-between;
  margin-right: 20px;
  &:last-child {
    margin-right: 0;
  }

  @media screen and (max-width: 600px) {
    width: 100%;
    justify-content: space-around;
    margin-bottom: 5px;
  }
}

.solvency-value {
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
}

.solvency-value--success {
  color: $color-green;
  background-color: $color-green-overlay;
}

.solvency-value--danger {
  color: $color-red;
  background-color: $color-red-overlay;
}
</style>
