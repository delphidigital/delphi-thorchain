<template>
  <div>
    <div class="section">
      <div class="section__header nodes-header">
        <h2 class="section__title">
          Standby Nodes
        </h2>
      </div>
      <div class="section__body">
        <div class="standby-nodes-container">
          <table class="section__table">
            <thead>
              <tr>
                <th class="section__table__head section__table__head--address">
                  Address
                </th>
                <th class="section__table__head section__table__head--location">
                  Location
                </th>
                <th class="section__table__head section__table__head--version">
                  Version
                </th>
                <th class="section__table__head section__table__head--status">
                  Status
                </th>
                <th class="section__table__head section__table__head--bond">
                  Bond
                </th>
                <th class="section__table__head section__table__head--status-since">
                  Status Since
                </th>
              </tr>
            </thead>
            <GeneralNodeRows
              :nodes="standbyNodesByBond.toChurnIn"
              type="toChurnIn"
            />
            <GeneralNodeRows
              :nodes="standbyNodesByBond.otherValidatorsByBond"
              type="otherValidatorsByBond"
            />
            <GeneralNodeRows
              :nodes="standbyNodesByBond.belowMinBond"
              type="belowMinBond"
            />
            <tr v-if="emptyList">
              <td colspan="6" class="section__table__data--no-nodes">
                No eligible standby nodes
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GeneralNodeRows from './GeneralNodeRows.vue';

export default {
  components: {
    GeneralNodeRows,
  },
  computed: {
    standbyNodesByBond() {
      return this.$store.getters['nodes/standbyNodesByBond'];
    },
    emptyList() {
      return this.$store.getters['nodes/totalStandbyCount'] === 0;
    },
  },
};
</script>
