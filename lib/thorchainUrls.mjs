import net from 'net';
import dns from 'dns';
import axios from 'axios';
import { startOfDay, sub, getUnixTime } from 'date-fns';
import redisClient from './redisClient.mjs';

// v1 docs: http://157.230.75.66:8080/v1/doc
// v2 docs: https://testnet.midgard.thorchain.info/v2/doc#operation/GetLiquidityHistory

// Delphi custom fully operational and your chaosnet node:
// delphi.chaosnet.single.crstin.com -> 157.90.98.200
// delphi.testnet.multi.crstin.com   -> 157.90.98.203
// delphi.testnet.single.crstin.com  -> 157.90.98.196

// TODO: call one of this methods every N hours and use the first ip instead of env variables
//   Testnet ips: https://testnet.seed.thorchain.info/
//   Mainnet ips: https://seed.thorchain.info/
// alternative (not sure why there is this other instance) https://testnet-seed.thorchain.info/
// TODO: Use e.g. https://testnet.midgard.thorchain.info/v2/network instead of ip for midgard api
//       Use e.g. https://midgard.thorchain.info/v2/network instead of ip for midgard api

// delphi.chaosnet.single  -->  157.90.98.200
// delphi.chaosnet.multi   -->  157.90.98.199
// delphi.testnet.single   -->  157.90.98.196
// delphi.testnet.multi    -->  157.90.98.198

const baseNodeIps = {
  testnet: process.env.TESTNET_NODE_IP || 'thorb.mctn.nexain.com',
  chaosnet: process.env.CHAOSNET_NODE_IP || 'thorb.mccn.nexain.com',
};

const thorchainNodeIps = { ...baseNodeIps };
    
// NOTE: Multichain connects to mupltiple blochchains, and singlenet only to binance chain
// to calculate things like deterministic price, need to sum the non rune depths from multi and single
// v1 singlechain docs: http://157.90.98.200:8080/v1/doc
const thorchainSingleChainIps = {
  testnet: process.env.TESTNET_NODE_IP_SINGLECHAIN || 'thorb.sctn.nexain.com',
  chaosnet: process.env.CHAOSNET_NODE_IP_SINGLECHAIN || 'thorb.sccn.nexain.com',
};

const getSinglechainStatsUrl = (blockchain) => {
  // NOTE: need to query v1 singlechain stats
  // e.g.: http://157.90.98.196:8080/v1/stats
  return `http://${thorchainSingleChainIps[blockchain]}:8080/v1/stats`;
};

const getSinglechainNetworkUrl = (blockchain) => {
  // NOTE: need to query v1 singlechain stats
  // e.g.: http://157.90.98.196:8080/v1/stats
  return `http://${thorchainSingleChainIps[blockchain]}:8080/v1/network`;
};

function getIpFromHostnameOrIp(hostnameOrIp) {
  return new Promise((res, rej) => {
    if (net.isIPv4(hostnameOrIp)) { return res(hostnameOrIp); }
    dns.lookup(hostnameOrIp, (err, address) => err ? rej(err) : res(address));
  });
}

// http://157.90.98.196:8080/v1/doc#operation/GetStats
// NOTE: Given an initial list of nodes for main net and test net, get the ip from the given hostname
//       and validate that the ip is listed at the thorchain seed nodes, else cache a valid node ip and use that
async function updateNodeSource(blockchain) {
  try {
    console.warn(`Validating node source ip.`);
    const redisKey = `thorchain::${blockchain}::source`;
    const rawdata = await redisClient.getAsync(redisKey);
    if (rawdata) {
      const sourceNode = JSON.parse(rawdata);
      if (sourceNode) {
        const oneHourAgo = sub(new Date(), { hours: 1 });
        if (oneHourAgo.getTime() < sourceNode.timestamp) {
          thorchainNodeIps[blockchain] = sourceNode.nodeIp;
          console.warn(`Using a recent node source ip: ${sourceNode.nodeIp}`);
          return sourceNode;
        }
      }
    }
    let url = 'https://seed.thorchain.info/';
    if (blockchain === 'testnet') {
      url = 'https://testnet.seed.thorchain.info/';
    }
    const response = await axios.get(url);
    // first validate the base node ip is available, if not, use the first available node
    let nodeIpOrHostname = baseNodeIps[blockchain];
    let nodeIp = await getIpFromHostnameOrIp(nodeIpOrHostname)
    // if the node ip is not listed, use a valid listed node ip
    if (response.data.indexOf(nodeIp) === -1) {
      nodeIp = response.data[0];
      console.warn(`[${blockchain}] Node IP ${nodeIp} is not listed at seeds list. Using node ${nodeIp} instead.`);
    } else {
      console.warn(`Updating node source: ${nodeIpOrHostname} - ip: ${nodeIp}`);
    }
    const timestamp = new Date().getTime();
    const source = { nodeIp, timestamp };
    thorchainNodeIps[blockchain] = nodeIp;
    await redisClient.setAsync(redisKey, JSON.stringify(source));
    return source;
  } catch (err) {
    console.error(`Error: getting source node ip. ${err.message}.`)
  } finally {
    return null;
  }
}

const thorchainPorts = {
  node: 1317,
  midgard: 8080, 
};

const thorchainBaseUrl = (thorchainNetwork, port) => (
  `http://${thorchainNodeIps[thorchainNetwork]}:${thorchainPorts[port]}`
);

const getThorchainUrls = (thorchainNetwork) => {
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
  return {
    nodeBase: apiUrls[thorchainNetwork]['node'],
    midgardBase: apiUrls[thorchainNetwork]['midgard'],
  };
};


const urlDataFetcher = (url) => async () => {
  const { data } = await axios.get(url);
  return data;
}

const requestHistoryPeriods = [
  // { interval: 'hour', count: 24 }, // '24H'
  // { interval: 'day', count: 7 }, // '1W'
  // { interval: 'day', count: 30 }, // '1M'
  // { interval: 'day', count: 90 }, // '3M'
  // // NOTE: the limit is 100 intervals, so we use sub, and consecutive calls for 6M and 1Y
  // { interval: 'day', sub: { months: 6 }}, // '6M'

  { interval: 'day', sub: { years: 2 }}, // '1Y'
  { interval: 'hour', sub: { months: 1 }}, // '1HM'
  { interval: 'year', count: 100 },
];

// NOTE: thorchainNetwork value can be 'chaosnet' or 'testnet'
export const thorchainDataFetcher = async (thorchainNetwork) => {
  await updateNodeSource(thorchainNetwork);
  const urls = getThorchainUrls(thorchainNetwork);
  const midgardBase = urls.midgardBase;
  const nodeBase = urls.nodeBase;
  // const cacheBase = urls.cacheBase;

  // Base Endpoints
  // const nodeUrl = nodeBase,
  // const midgarUrl = midgardBase,

  // Thornode
  const nodeVersionUrl = `${nodeBase}/thorchain/version`;


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
  // v1: http://157.230.75.66:1317/thorchain/mimir
  // v2: http://18.193.249.209:1317/thorchain/mimir
  const mimirUrl = `${nodeBase}/thorchain/mimir`;

  // v1: http://157.230.75.66:1317/thorchain/vaults/asgard
  // v2: http://18.193.249.209:1317/thorchain/vaults/asgard
  const asgardVaultsUrl = `${nodeBase}/thorchain/vaults/asgard`;

  // https://testnet.midgard.thorchain.info/v2/doc#operation/GetProxiedInboundAddresses
  // NOTE:
  // v1: http://157.230.75.66:8080/v1/thorchain/pool_addresses
  // v2: http://18.193.249.209:8080/v2/thorchain/inbound_addresses    
  // v1 returned { current: any[] } and v2 returns any[]
  const inboundAddressesUrl = `${midgardBase}/v2/thorchain/inbound_addresses`;

  // Midgard urls

  // NOTE: v2 Property status renamed from 'Enabled' to 'available'
  // old: http://138.201.80.182:1317/thorchain/pools
  // new: http://18.198.92.45:1317/thorchain/pools
  // const poolsUrl = `${nodeBase}/thorchain/pools`;
  // https://testnet.midgard.thorchain.info/v2/doc#operation/GetPools
  // v1: http://157.230.75.66:1317/thorchain/pools
  // v2: http://18.193.249.209:1317/thorchain/pools
  // NOTE Property status renamed from 'Enabled' to 'Available' in v2
  const poolsUrl = `${midgardBase}/v2/pools`

  
  // http://18.198.244.16:1317/v2/thorchain/queue
  const queueUrl = `${midgardBase}/v2/thorchain/queue`

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

  // DOCS: https://testnet.midgard.thorchain.info/v2/doc#operation/GetDepthHistory
  // e.g.: http://18.193.249.209:8080/v2/history/depths/BCH.BCH?interval=day&count=10
  const poolHistoryDepths =  (asset, interval, count) => (
    `${midgardBase}/v2/history/depths/${asset}?interval=${interval}&count=${count}`
  );

  // DOCS: http://18.193.249.209:8080/v2/doc#operation/GetSwapHistory
  // e.g.: http://18.157.111.52:8080/v2/history/swaps?interval=day&count=10&pool=BCH.BCH
  const poolHistorySwaps =  (interval, count, asset) => {
    const assetQuery = asset ? `&pool=${asset}` : ''
    return `${midgardBase}/v2/history/swaps?interval=${interval}&count=${count}${assetQuery}`;
  };

  // DOCS: https://testnet.midgard.thorchain.info/v2/doc#operation/GetEarningsHistory
  // e.g.: http://18.193.249.209:8080/v2/history/earnings?interval=day&count=30
  const allHistoryEarnings =  (interval, count) => {
    return `${midgardBase}/v2/history/earnings?interval=${interval}&count=${count}`;
  };

  const apiQueryForLongHistory = async (interval, subPeriod, baseUrl, getMeta) => {
    const nowDate = new Date();
    const nowUnixTime = getUnixTime(nowDate);
    const fromDate = sub(startOfDay(nowDate), subPeriod)
    let from = getUnixTime(fromDate);
    const payload = {
      intervals: [],
      meta: {}
    }
    let continueRequest = true;
    // paginate through dates since there is a 400 interval limit
    // console.log(`Long Query starts`);
    do {
      const url = `${baseUrl}interval=${interval}&from=${from}&count=400`;
      // console.log(`Requesting ${url}`);
      const returnData = await urlDataFetcher(url)();
      returnData.intervals.forEach((interval, index) => {
        if (parseInt(interval.startTime, 10) <= nowUnixTime) {
          payload.intervals.push(interval);
        }
        if (parseInt(interval.startTime, 10) >= nowUnixTime) {
          continueRequest = false;
        }
        if (continueRequest && index === (returnData.intervals.length - 1)) {
          from = parseInt(interval.endTime, 10);
        }
      });
    } while(continueRequest);
    if (getMeta) {
      // finally get only the meta property for the period
      const metaOnlyUrl = `${midgardBase}/v2/history/earnings?from=${getUnixTime(fromDate)}&to=${nowUnixTime}`;
      const metaData = await urlDataFetcher(metaOnlyUrl)();
      payload.meta = metaData.meta;
    } else {
      payload.endTime = nowUnixTime.toString();
      payload.startTime = getUnixTime(fromDate).toString();
    }
    return payload;
  }

  return {
    loadQueue: urlDataFetcher(queueUrl),
    loadPools: urlDataFetcher(poolsUrl),
    loadPoolStats: async (asset) => {
      // TODO: optimize the frecuency for polling periods data
      const periods = ['1h', '24h', '7d', '30d', '90d', '365d', 'all'];
      const [
        period1H, period24H, period7D, period30D, period90D, period365D, periodALL
      ] = await Promise.all(periods.map((period) => (
        urlDataFetcher(poolStatsUrl(asset, period))()
      )));
      console.log(`Loaded pool stats. Asset: ${asset}`);
      return {
        period1H, period24H, period7D, period30D, period90D, period365D, periodALL
      }
    },
    loadHistoryDepths: async (asset) => {
      const [
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(poolHistoryDepths(asset, p.interval, p.count))();
        }
        const baseUrl = `${midgardBase}/v2/history/depths/${asset}?`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, false);
      }));
      console.log(`Loaded pool history depths. Asset: ${asset}`);
      return {
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      }
    },
    loadHistorySwaps: async (asset) => {
      const [
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(poolHistorySwaps(p.interval, p.count, asset))()
        }
        const baseUrl = `${midgardBase}/v2/history/swaps?pool=${asset}&`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, true);
      }));
      console.log(`Loaded pool history swaps. Asset: ${asset}`);
      return {
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      }
    },
    loadHistoryEarnings: async () => {
      const [
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(allHistoryEarnings(p.interval, p.count))()
        }
        const baseUrl = `${midgardBase}/v2/history/earnings?`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, true);
      }));
      console.log(`Loaded pools history earnings`);
      return {
        // period24H, period1W, period1M, period3M, period6M,
        period1Y, period1HM, allTimePeriod
      }
    },
    loadV1SinglechainStats: async () => {
      const statsUrl = getSinglechainStatsUrl(thorchainNetwork);
      const statsData = await urlDataFetcher(statsUrl)();
      return statsData;
    },
    loadV1SinglechainNetwork: async () => {
      const networkUrl = getSinglechainNetworkUrl(thorchainNetwork);
      const networkData = await urlDataFetcher(networkUrl)();
      return networkData;
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
