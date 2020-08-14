<template>
  <tbody>
    <tr
      v-for="node in nodes"
      :key="node['node_address']"
      :class="`section__table__row ${rowClass()}`"
    >
      <FavouriteNodeTD :node-address="node['node_address']" />
      <td class="section__table__data section__table__data--address">
        <Address :address="node['node_address']" :max-chars="20" />
      </td>
      <td class="section__table__data section__table__data--location">
        {{ node.location.city }}, {{ node.location.country }}
      </td>
      <td class="section__table__data section__table__data--version">
        {{ node.version }}
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
          <div v-if="type === 'forcedToLeave'">
            forced to leave
          </div>
          <div v-if="type === 'requestedToLeave'">
            requested to leave
          </div>
          <div v-if="type === 'oldestValidators'">
            <span class="churn-status churn-status--out">Will churn due to age</span>
          </div>
          <div v-if="type === 'otherValidatorsByAge'">
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
import FavouriteNodeTD from './FavouriteNodeTD.vue';

export default {
  components: {
    FavouriteNodeTD,
  },
  props: {
    nodes: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isInJail(node) {
        return (node.jail['release_height'] > this.lastBlock);
      },
      numeral,
      rowClass() {
        if (['forcedToLeave', 'requestedToLeave', 'oldestValidators'].includes(this.type)) {
          return 'section__table__row--will-churn';
        }
        return '';
      },
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
      return this.$store.state.nodes.lastBlock;
    },
  },
};
</script>

