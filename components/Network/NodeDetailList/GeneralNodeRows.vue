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
        <span v-if="node.location.org && node.location.org.length">
          {{ node.location.org }},
        </span>
        <span v-if="node.location.city && node.location.city.length">
          {{ node.location.city }},
        </span>
        {{ node.location.country }}
      </td>
      <td class="section__table__data section__table__data--version">
        {{ node.version }}
      </td>
      <td class="section__table__data section__table__data--status">
        {{ node.status }}
      </td>
      <td class="section__table__data section__table__data--status-desc">
        <span v-if="type === 'toChurnIn'" class="churn-status churn-status--in">
          Will churn in
        </span>
        <span v-if="type === 'belowMinBond'" class="churn-status churn-status--out">
          Bond too low
        </span>
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
import FavouriteNodeTD from './../../Common/FavouriteNodeTD.vue';

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
      numeral,
      timeFromBlock(sinceBlock) {
        const secondsPerBlock = this.$store.state.nodes.secondsPerBlock;
        const blocksSince = this.lastBlock - sinceBlock;
        const secondsSince = blocksSince * secondsPerBlock;
        return formatDistance(0, secondsSince * 1000);
      },
      rowClass() {
        if (['toChurnIn'].includes(this.type)) {
          return 'section__table__row--will-churn-in';
        }
        if (['belowMinBond'].includes(this.type)) {
          return 'section__table__row--will-churn';
        }
        return '';
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
