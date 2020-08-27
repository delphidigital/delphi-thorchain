// http://3.17.122.84:1317/thorchain/nodeaccounts
// http://52.221.153.64:8080/v1/pools
// http://3.17.122.84:8080/v1/pools/detail?asset=BNB.KFT-94F

import fns from 'date-fns';
import thorchainUrls from './thorchainUrls.mjs';


export default (blockchain) => {
  const urls = thorchainUrls(blockchain);
  const midgardBase = urls.midgardBase;
  const nodeBase = urls.nodeBase;

  return {
    poolsUrl() {
      return `${midgardBase}/v1/pools`;
    },
    poolDetailUrl({ asset }) {
      return `${midgardBase}/v1/pools/detail?asset=${asset}`;
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
    statsUrl() {
      return `${midgardBase}/v1/stats`;
    },
    networkUrl() {
      return `${midgardBase}/v1/network`;
    },
    constantsUrl() {
      return `${midgardBase}/v1/thorchain/constants`;
    },
    marketDataUrl() {
      return `/${blockchain}/int/marketdata`;
    },
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
    async loadMarketData({ axios }) {
      const url = this.marketDataUrl();
      const { data } = await axios.get(url);
      return data;
    },
  }
}
