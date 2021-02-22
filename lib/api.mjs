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
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetPools
      // v1: http://157.230.75.66:1317/thorchain/pools
      // v2: http://18.193.249.209:1317/thorchain/pools
      // NOTE Property status renamed from 'Enabled' to 'Available' in v2
      return `${nodeBase}/thorchain/pools`;
    },

    nodesUrl() {
      // v1: http://157.230.75.66:1317/thorchain/nodeaccounts
      // v2: http://18.193.249.209:1317/thorchain/nodes
      return `${nodeBase}/thorchain/nodes`;
    },

    lastBlockUrl() {
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetProxiedLastblock
      // http://18.193.249.209:8080/v2/thorchain/lastblock
      // in v1 returns an object, v2 returns an array of objects
      // v1: http://157.230.75.66:1317/thorchain/lastblock
      // v2: http://18.193.249.209:1317/thorchain/lastblock
      return `${nodeBase}/thorchain/lastblock`;
    },

    mimirUrl() {
      // v1: http://157.230.75.66:1317/thorchain/mimir
      // v2: http://18.193.249.209:1317/thorchain/mimir
      return `${nodeBase}/thorchain/mimir`;
    },

    asgardVaultsUrl() {
      // v1: http://157.230.75.66:1317/thorchain/vaults/asgard
      // v2: http://18.193.249.209:1317/thorchain/vaults/asgard
      return `${nodeBase}/thorchain/vaults/asgard`;
    },

    inboundAddressesUrl() { // was poolAddressesUrl
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetProxiedInboundAddresses
      // NOTE:
      // v1: http://157.230.75.66:8080/v1/thorchain/pool_addresses
      // v2: http://18.193.249.209:8080/v2/thorchain/inbound_addresses    
      // v1 returned { current: any[] } and v2 returns any[]
      return `${midgardBase}/v2/thorchain/inbound_addresses`;
    },

    // Midgard
    poolDetailUrl({ asset }) {
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetPoolStatsLegacy
      // v1: http://157.230.75.66:8080/v1/pools/detail?asset=BNB.BNB
      // v2: http://18.193.249.209:8080/v2/pool/BNB.BNB/stats/legacy
      // note v1 returned an array, v2 returns the object
      return `${midgardBase}/v2/pool/${asset}/stats/legacy`;
    },
    statsUrl() {
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetStats
      // v1: http://157.230.75.66:8080/v1/stats
      // v2: http://18.193.249.209:8080/v2/stats
      // some properties are missing or different
      return `${midgardBase}/v2/stats`;
    },
    networkUrl() {
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetNetworkData
      // v1: http://157.230.75.66:8080/v1/network
      // v2: http://18.193.249.209:8080/v2/network // currently failing in v2
      return `${midgardBase}/v2/network`;
    },
    constantsUrl() {
      // https://testnet.midgard.thorchain.info/v2/doc#operation/GetProxiedConstants
      // v1: http://157.230.75.66:8080/v1/thorchain/constants
      // v2: http://18.193.249.209:8080/v2/thorchain/constants
      return `${midgardBase}/v2/thorchain/constants`;
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
      console.warn(`API QUERY: ${url}`);
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
