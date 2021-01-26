<template>
  <tbody>
    <tr
      v-for="node in nodes"
      :key="node['node_address']"
      class="section__table__row"
      :class="{'section__table__row--will-churn': node.showAsWillChurn}"
    >
      <FavouriteNodeTD :node-address="node['node_address']" />
      <td class="section__table__data section__table__data--address">
        <Address :address="node['node_address']" :max-chars="20" />
      </td>
      <td class="section__table__data section__table__data--location">
        <span class="section__table__data--longvalue">{{ formatLocation(node.location) }}</span>
      </td>
      <td class="section__table__data section__table__data--version">
        {{ node.version }}
      </td>
      <td
        class="section__table__data section__table__data--score"
        :class="{'section__table__score--will-churn-score': node.lowScore}"
      >
        {{ (node.score) ? Math.floor(node.score) : '' }}
      </td>
      <td class="section__table__data section__table__data--status">
        <div v-if="isInJail(node)">
          <div class="jailed">
            Jailed: {{ node.jail.reason }}
          </div>
          <div class="jailed-detail">
            Release in
            <img src="/hourglass.svg"></img>
            {{ timeFromBlock(node.jail['release_height']) }}
            <img src="/cube.svg"></img>
            {{ numeral(node.jail['release_height']).format('0,0') }}
          </div>
        </div>
        <div v-if="!isInJail(node)">
          <div v-if="node.churnStatusType === 'forcedToLeave'">
            forced to leave
          </div>
          <div v-if="node.churnStatusType === 'requestedToLeave'">
            requested to leave
          </div>
          <div v-if="node.churnStatusType === 'markedToLeave'">
            <span class="churn-status churn-status--out">Will churn out</span>
          </div>
          <div v-if="node.churnStatusType === 'oldest'">
            <span class="churn-status churn-status--out">May churn due to age</span>
          </div>
          <div v-if="node.churnStatusType === 'badNode'">
            <span class="churn-status churn-status--out">Behaviour score</span>
          </div>
          <div v-if="node.churnStatusType === 'lowVersion'">
            <span class="churn-status churn-status--out">Version is low</span>
          </div>
          <div v-if="node.churnStatusType === 'active'">
            active
          </div>
        </div>
      </td>
      <td class="section__table__data section__table__data--bond">
        {{ numeral(Math.round(node.bond)).format('0,0') }}
      </td>
      <td class="section__table__data section__table__data--status-since">
        {{ numeral(node['status_since']).format('0,0') }}
        <span class="status-since-time">({{ timeFromBlock(node['status_since']) }} ago)</span>
      </td>
    </tr>
  </tbody>
</template>

<script>
import { formatDistance } from 'date-fns';
import numeral from 'numeral';
import FavouriteNodeTD from '../../Common/FavouriteNodeTD.vue';
import { formatLocation } from '../../../lib/formatHelpers.mjs';

export default {
  components: {
    FavouriteNodeTD,
  },
  props: {
    nodes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      formatLocation,
      isInJail(node) {
        return (node.jail['release_height'] > this.lastBlock);
      },
      numeral,
      timeFromBlock(sinceBlock) {
        const secondsPerBlock = this.$store.state.nodes.secondsPerBlock;
        const blocksSince = this.lastBlock - sinceBlock;
        const secondsSince = blocksSince * secondsPerBlock;
        return formatDistance(0, secondsSince * 1000);
      },
    };
  },
  computed: {
    lastBlock() {
      return this.$store.state.networkHealth.lastThorchainBlock;
    },
  },
};
</script>
