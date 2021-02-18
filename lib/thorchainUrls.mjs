import axios from 'axios';
import { startOfDay, sub, getUnixTime } from 'date-fns';

// v1 docs: http://157.230.75.66:8080/v1/doc
// v2 docs: https://testnet.midgard.thorchain.info/v2/doc#operation/GetLiquidityHistory
const thorchainNodeIps = {
  testnet: process.env.TESTNET_NODE_IP || '18.193.249.209',
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

const requestHistoryPeriods = [
  { interval: 'hour', count: 24 }, // '24H'
  { interval: 'day', count: 7 }, // '1W'
  { interval: 'day', count: 30 }, // '1M'
  { interval: 'day', count: 90 }, // '3M'
  // NOTE: the limit is 100 intervals, so we use sub, and consecutive calls for 6M and 1Y
  { interval: 'day', sub: { months: 6 }}, // '6M'
  { interval: 'day', sub: { years: 1 }}, // '1Y'
  { interval: 'hour', sub: { months: 1 }}, // '1HM'
];

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
  // e.g.: http://18.193.249.209:8080/v2/history/swaps?interval=day&count=10&pool=BCH.BCH
  const poolHistorySwaps =  (interval, count, asset) => {
    const assetQuery = asset ? `&=pool${asset}` : ''
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
    // paginate through dates since there is a 100 interval limit
    console.log(`Long Query starts`);
    do {
      const url = `${baseUrl}interval=${interval}&from=${from}&count=100`;
      console.log(`Requesting ${url}`);
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
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM,
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(poolHistoryDepths(asset, p.interval, p.count))();
        }
        const baseUrl = `${midgardBase}/v2/history/depths/${asset}?`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, false);
      }));
      console.log(`Loaded pool history depths. Asset: ${asset}`);
      return {
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM
      }
    },
    loadHistorySwaps: async (asset) => {
      const [
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM,
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(poolHistorySwaps(p.interval, p.count, asset))()
        }
        const baseUrl = `${midgardBase}/v2/history/swaps?=pool${asset}&`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, true);
      }));
      console.log(`Loaded pool history swaps. Asset: ${asset}`);
      return {
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM
      }
    },
    loadHistoryEarnings: async () => {
      const [
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM,
      ] = await Promise.all(requestHistoryPeriods.map((p) => {
        if (p.count) {
          return urlDataFetcher(allHistoryEarnings(p.interval, p.count))()
        }
        const baseUrl = `${midgardBase}/v2/history/earnings?`;
        return apiQueryForLongHistory(p.interval, p.sub, baseUrl, true);
      }));
      console.log(`Loaded pools history earnings`);
      return {
        period24H, period1W, period1M, period3M, period6M, period1Y, period1HM
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
