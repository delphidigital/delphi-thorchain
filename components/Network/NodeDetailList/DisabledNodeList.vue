<template>
  <div>
    <div class="section">
      <div class="section__header network-nodes-header">
        <h2 class="section__title">
          Disabled nodes
        </h2>
        <span class="section__title__note">
          * note: disabled nodes will never be churned back in even when rebonded
        </span>
      </div>
      <div class="section__body">
        <div class="disabled-nodes-container">
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
                  Disabled at
                </th>
              </tr>
            </thead>
            <GeneralNodeRows
              v-if="!emptyList"
              :nodes="disabledNodes"
              type="disabled"
            />
            <tbody v-if="emptyList">
              <tr>
                <td colspan="7" class="section__table__data--no-nodes">
                  No disabled nodes
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
    disabledNodes() {
      return this.$store.getters['nodes/disabledNodes'];
    },
    emptyList() {
      return this.disabledNodes.length === 0;
    },
  },
};
</script>

<style lang="scss">
  .disabled-nodes-container {
    overflow-x: scroll;
    table {
      min-width: 900px;
      color: $color-white-opacity;
      .status-since-time {
        color: $color-white-opacity;
      }
    }
  }
</style>
