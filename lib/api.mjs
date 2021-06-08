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
      return `${nodeBase}/thorchain/pools`;
    },
    nodesUrl() {
      return `${nodeBase}/thorchain/nodeaccounts`;
    },
    lastBlockUrl() {
      return `${nodeBase}/thorchain/lastblock`;
    },
    mimirUrl() {
      return `${nodeBase}/thorchain/mimir`;
    },
    asgardVaultsUrl() {
      return `${nodeBase}/thorchain/vaults/asgard`;
    },
    poolAddressesUrl() {
      return `${nodeBase}/thorchain/pool_addresses`;
    },

    // Midgard
    
    poolDetailUrl({ asset }) {
      return `${midgardBase}/v1/pools/detail?asset=${asset}`;
    },
    statsUrl() {
      return `${midgardBase}/v1/stats`;
    },
    networkUrl() {
      return `${midgardBase}/v1/network`;
    },
    statsHistoryUrl({interval, from, to}) {
      return `${midgardBase}/v1/history/stats?interval=${interval}&from=${from}&to=${to}`;
    },
    constantsUrl() {
      return `${midgardBase}/v1/thorchain/constants`;
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
    async loadPoolAddresses({ axios }) {
      const url = this.poolAddressesUrl();
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
    async loadStatsHistory({ axios }) {
      // NOTE(Pierre): /v1/history/stats is a new endpoint and only available
      // on the chaosnet IP AFAICT, so we stub it here if on testnet to allow
      // the page to still load without it. This can be removed once the testnet
      // IP implements it too.
      if(blockchain !== "chaosnet")
        return [
          {time: fns.getUnixTime(fns.sub(Date.now(), {days: 12})), totalRuneDepth:0},
          {time: fns.getUnixTime(Date.now()), totalRuneDepth:0},
        ];

      // NOTE(Pierre): The requested time range has to be set in stone here,
      // to allow the response data to be stored and referred to under a single
      // key in the redis cache
      const url = this.statsHistoryUrl({
        interval: 'day',
        from: fns.getUnixTime(fns.sub(Date.now(), {days: 12})),
        to: fns.getUnixTime(Date.now())
      });

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
