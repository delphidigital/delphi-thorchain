import axios from 'axios';

const thorchainNodeIps = {
  testnet: process.env.TESTNET_NODE_IP || '18.198.92.45',
  chaosnet: process.env.CHAOSNET_NODE_IP || '168.119.20.164',
};

const thorchainPorts = {
  node: 1317,
  midgard: 8080, 
};

const thorchainBaseUrl = (thorchainNetwork, port) => (
  `http://${thorchainNodeIps[thorchainNetwork]}:${thorchainPorts[port]}`
);

const apiUrls = {
  chaosnet: {
    node: thorchainBaseUrl('chaosnet', 'node'),
    midgard: thorchainBaseUrl('chaosnet', 'midgard'),
  },
  testnet: {
    node: thorchainBaseUrl('testnet', 'node'),
    midgard: thorchainBaseUrl('testnet', 'midgard'),
  },
};

export const getThorchainUrls = (thorchainNetwork) => ({
  nodeBase: apiUrls[thorchainNetwork]['node'],
  midgardBase: apiUrls[thorchainNetwork]['midgard'],
});


const urlDataFetcher = (url) => async () => {
  const { data } = await axios.get(url);
  return data;
}

// NOTE: thorchainNetwork value can be 'chaosnet' or 'testnet'
export const thorchainDataFetcher = (thorchainNetwork) => {
  const urls = getThorchainUrls(thorchainNetwork);
  const midgardBase = urls.midgardBase;
  const nodeBase = urls.nodeBase;
  // const cacheBase = urls.cacheBase;

  // Base Endpoints
  // const nodeUrl = nodeBase,
  // const midgarUrl = midgardBase,

  // Thornode
  const nodeVersionUrl = `${nodeBase}/thorchain/version`;

  // NOTE: v2 Property status renamed from 'Enabled' to 'Available'
  // old: http://138.201.80.182:1317/thorchain/pools
  // new: http://18.198.92.45:1317/thorchain/pools
  const poolsUrl = `${nodeBase}/thorchain/pools`;

  // NOTE: v2 different path but same payload
  // => `${nodeBase}/thorchain/nodeaccounts`; // old path
  const nodesUrl = `${nodeBase}/thorchain/nodes`;

  // NOTE: v2 different payload, now it's an array
  const lastBlockUrl = `${nodeBase}/thorchain/lastblock`;

  // NOTE: not 100% sure type since current payload returns {}
  // old shape:
  // {
  //   "mimir//DESIREVALIDATORSET": "20",
  //   "mimir//ROTATEPERBLOCKHEIGHT": "2160"
  // }
  const mimirUrl = `${nodeBase}/thorchain/mimir`;

  const asgardVaultsUrl = `${nodeBase}/thorchain/vaults/asgard`;

  // NOTE: v2 same payload, changed path
  // new: http://18.198.92.45:1317/thorchain/inbound_addresses
  // old: http://138.201.80.182:1317/thorchain/pool_addresses
  const inboundAddressesUrl = `${nodeBase}/thorchain/inbound_addresses`;

  // Midgard urls

  // NOTE: v2 changed this endpoint.
  // new stats: http://18.198.92.45:8080/v2/pool/BNB.BNB/stats?period=all
  // new no legacy: http://18.198.92.45:8080/v2/pool/BNB.BNB
  // new legacy http://18.198.92.45:8080/v2/pool-legacy/BNB.BNB
  // old: http://138.201.80.182:8080/v1/pools/detail?asset=BNB.BNB
  // DOCS: http://18.198.92.45:8080/v2/doc#operation/GetPoolStats
  //       valid periods: "1h" "24h" "7d" "30d" "90d" "365d" "all"
  const poolStatsUrl = (asset, period) => `${midgardBase}/v2/pool/${asset}/stats?period=${period}`;

  // NOTE: v2 shape is the same as v1 without : [poolCount, totalEarned, totalVolume24hr]
  // new: http://18.198.92.45:8080/v2/stats
  // old: http://18.158.236.117:8080/v1/stats
  const statsUrl = `${midgardBase}/v2/stats`;

  // NOTE: v2 some properties changed like standbyNodeCount is now string, totalPooledRune and totalStaked
  // new: http://18.198.92.45:8080/v2/network
  // old: http://18.158.236.117:8080/v1/network
  const networkUrl = `${midgardBase}/v2/network`;

  // new: http://18.198.92.45:8080/v2/thorchain/constants
  // old: http://18.158.236.117:8080/v1/thorchain/constants
  const constantsUrl = `${midgardBase}/v2/thorchain/constants`;


  return {
    loadPools: urlDataFetcher(poolsUrl),
    loadPoolStats: async (asset) => {
      // TODO: optimize the frecuency for polling periods data
      const periods = ['1h', '24h', '7d', '30d', '90d', '365d', 'all'];
      const [
        period1h, period24h, period7d, period30d, period90d, period365d, periodAll
      ] = await Promise.all(periods.map((period) => (
        urlDataFetcher(poolStatsUrl(asset, period))()
      )));
      return {
        period1h, period24h, period7d, period30d, period90d, period365d, periodAll
      }
    },
    loadNodeAccounts: urlDataFetcher(nodesUrl),
    loadLastBlock: urlDataFetcher(lastBlockUrl),
    loadMimir: urlDataFetcher(mimirUrl),
    loadAsgardVaults: urlDataFetcher(asgardVaultsUrl),
    loadInboundAddresses: urlDataFetcher(inboundAddressesUrl),
    loadStats: urlDataFetcher(statsUrl),
    loadNetwork: urlDataFetcher(networkUrl),
    loadConstants: urlDataFetcher(constantsUrl),
    loadNodeVersion: urlDataFetcher(nodeVersionUrl),
  };
};
