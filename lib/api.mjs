// http://3.17.122.84:1317/thorchain/nodeaccounts
// http://52.221.153.64:8080/v1/pools
// http://3.17.122.84:8080/v1/pools/detail?asset=BNB.KFT-94F

import fns from 'date-fns';
import thorchainUrls from './thorchainUrls.mjs';


export default (blockchain) => {
  const urls = thorchainUrls(blockchain);
  const midgardBase = urls.midgardBase;
  const nodeBase = urls.nodeBase;
  const cacheBase = urls.cacheBase;

  return {
    // Base Endpoints
    nodeUrl() {
      return nodeBase;
    },
    midgarUrl() {
      return midgardBase;
    },

    // Thornode

    poolsUrl() {
      // Property status 'Enabled' is now 'Available'
      // old: http://138.201.80.182:1317/thorchain/pools
      // new: http://18.198.92.45:1317/thorchain/pools
      return `${nodeBase}/thorchain/pools`;
    },
    nodesUrl() {
      return `${nodeBase}/thorchain/nodes`; // different path but same payload
      // return `${nodeBase}/thorchain/nodeaccounts`; // old path
    },
    lastBlockUrl() {
      return `${nodeBase}/thorchain/lastblock`; // different payload, now it's an array
    },
    mimirUrl() {
      return `${nodeBase}/thorchain/mimir`; // not 100% sure type since current payload returns {}
      // old shape:
      // {
      //   "mimir//DESIREVALIDATORSET": "20",
      //   "mimir//ROTATEPERBLOCKHEIGHT": "2160"
      // }
    },
    asgardVaultsUrl() {
      return `${nodeBase}/thorchain/vaults/asgard`;
    },

    // new: http://18.198.92.45:1317/thorchain/inbound_addresses
    // old: http://138.201.80.182:1317/thorchain/pool_addresses
    inboundAddressesUrl() {
      return `${nodeBase}/thorchain/inbound_addresses`; // same payload
    },

    // Midgard
    poolDetailUrl({ asset }) {
      // TODO: maybe not use legacy
      // new no legacy: http://18.198.92.45:8080/v2/pool/BNB.BNB
      // new http://18.198.92.45:8080/v2/pool-legacy/BNB.BNB
      // old: http://138.201.80.182:8080/v1/pools/detail?asset=BNB.BNB
      // return `${midgardBase}/v2/pool-legacy/${asset}`;
      // return `${midgardBase}/v2/pool/${asset}`;
      // NOTE: using pool-legacy endpoint because it returns poolVolume value used for some calculations
      return `${midgardBase}/v2/pool-legacy/${asset}`;
      // NOTE:! the return param sellFeeAverage is used in the frontend, but the api is not supporting it now
    },
    statsUrl() {
      // new: http://18.198.92.45:8080/v2/stats
      // old: http://18.158.236.117:8080/v1/stats
      return `${midgardBase}/v2/stats`;
      // Shape is the same as v1 without : [poolCount, totalEarned, totalVolume24hr]
    },
    networkUrl() {
      // new: http://18.198.92.45:8080/v2/network
      // old: http://18.158.236.117:8080/v1/network
      return `${midgardBase}/v2/network`; // same
      // but some properties changed like standbyNodeCount is now string, totalPooledRune and totalStaked
    },
    constantsUrl() {
      // new: http://18.198.92.45:8080/v2/thorchain/constants
      // old: http://18.158.236.117:8080/v1/thorchain/constants
      return `${midgardBase}/v2/thorchain/constants`; // same, some props updated?
    },

    // Cache only
    marketDataUrl() {
      return `${cacheBase}/int/marketdata`;
    },
    runevaultBalanceUrl() {
      return `${cacheBase}/int/runevaultBalance`;
    },

    // API Mirrors
    async loadPools({ axios }) {
      const url = this.poolsUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadPoolDetail({ axios, poolId }) {
      const url = this.poolDetailUrl({ asset: poolId });
      const { data } = await axios.get(url);
      return data;
    },
    async loadNodeAccounts({ axios }) {
      const url = this.nodesUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadLastBlock({ axios }) {
      const url = this.lastBlockUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadMimir({ axios }) {
      const url = this.mimirUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadAsgardVaults({ axios }) {
      const url = this.asgardVaultsUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadInboundAddresses({ axios }) {
      const url = this.inboundAddressesUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadStats({ axios }) {
      const url = this.statsUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadNetwork({ axios }) {
      const url = this.networkUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadConstants({ axios }) {
      const url = this.constantsUrl();
      const { data } = await axios.get(url);
      return data;
    },

    // Cache only
   
    async loadMarketData({ axios }) {
      const url = this.marketDataUrl();
      const { data } = await axios.get(url);
      return data;
    },
    async loadRunevaultBalance({ axios }) {
      const url = this.runevaultBalanceUrl();
      const { data } = await axios.get(url);
      return data;
    },
    // NOTE(Fede): Will start dumping all the extra data we need on a single endpoint
    // as it is more performant and we also treat the whole data as a block so ideally
    // there would be a single endpoint that gets all data from cache at once.
    // Don't want to keep adding endpoints forever if it is not needed. We might in the
    // future if it makes sense though
    async loadCacheExtra({ axios }) {
      const url = `${cacheBase}/int/extra`
      const { data } = await axios.get(url);
      return data;
    },
  };
}
