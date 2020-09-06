<template>
  <div>
    <div class="section">
      <div class="section__header network-nodes-header">
        <h2 class="section__title">
          Ready Nodes
        </h2>
      </div>
      <div class="section__body">
        <div class="standby-nodes-container">
          <table class="section__table network-nodes-table">
            <thead>
              <tr>
                <th class="section__table__head section__table__head--star" />
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
                <th class="section__table__head section__table__head--status-desc" />
                <th class="section__table__head section__table__head--bond">
                  Bond
                </th>
                <th class="section__table__head section__table__head--status-since">
                  Status Since
                </th>
              </tr>
            </thead>
            <GeneralNodeRows
              :nodes="readyNodesByBond.toChurnIn"
              type="toChurnIn"
            />
            <GeneralNodeRows
              :nodes="readyNodesByBond.otherValidatorsByBond"
              type="otherValidatorsByBond"
            />
            <GeneralNodeRows
              :nodes="readyNodesByBond.belowMinBond"
              type="belowMinBond"
            />
            <tbody>
              <tr v-if="emptyList">
                <td colspan="8" class="section__table__data--no-nodes">
                  No ready nodes
                </td>
              </tr>
            </tbody>
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
    readyNodesByBond() {
      return this.$store.getters['nodes/readyNodesByBond'];
    },
    emptyList() {
      return this.$store.getters['nodes/totalReadyCount'] === 0;
    },
  },
};
</script>
