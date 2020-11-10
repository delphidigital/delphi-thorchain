import ThorchainApi from '../lib/api.mjs';
import { loadBinanceChain } from '../lib/binanceApi.mjs';

import axios from 'axios';
import fs from 'fs';
import redis from 'redis';
import { promisify } from 'util';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';

process.on('unhandledRejection', up => { throw up });

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

async function redisSet(key, data) {
  await setAsync(key, JSON.stringify(data));
}

async function getRuneMarketData() {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
  return response.data.market_data;
}

async function updateBlockchainData(blockchain) {
  const start = new Date();
  console.log(`[${blockchain}]: starting data fetch...`)
  const set = (key, data) => redisSet(`thorchain::${blockchain}::${key}`, data);
  const api = ThorchainApi(blockchain);

  // FETCH DATA
  // Thorchain
  const poolList = await api.loadPools({ axios });
  const poolIds = poolList.filter(i => i.status === 'Enabled').map(i => i.asset);
  let poolDetails = {} 
  for (const poolId of poolIds) {
    const poolDetail = await api.loadPoolDetail({ axios, poolId });
    poolDetails[poolId] = poolDetail;
  }
  const nodeAccounts = await api.loadNodeAccounts({ axios });
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => {
      return await lookupGeoIP(nodeAccount['ip_address']);
    });
    return { ...nodeAccount, location: lookup };
  }));
  const lastBlock = await api.loadLastBlock({ axios });
  const mimir = await api.loadMimir({ axios });
  const asgardVaults = await api.loadAsgardVaults({ axios });
  const poolAddresses = await api.loadPoolAddresses({ axios });
  const stats = await api.loadStats({ axios });
  const network = await api.loadNetwork({ axios });
  const constants = await api.loadConstants({ axios });
  const versionRequest = await axios.get(`${api.nodeUrl()}/thorchain/version`);

  // Other sources
  const binanceChain = await loadBinanceChain({ axios }, blockchain);
  const runeMarketData = await getRuneMarketData()
  let runevaultBalance = 0;
  if( blockchain === 'chaosnet') {
    const frozenBalancesReq = await axios.get("http://frozenbalances.herokuapp.com/stats/RUNE-B1A");
    runevaultBalance = frozenBalancesReq.data.totalFrozen;
  }

  // PROCESS RESULTS
  const totalStaked = parseInt(stats.totalStaked);
  const totalBonded = Object.values(nodeAccounts).reduce((total, node) => (
    total + parseInt(node.bond)
  ), 0);
  const circulating = blockchain === 'testnet' ?
    ((totalBonded + totalStaked) / (10 ** 8)).toFixed(2) : runeMarketData.circulating_supply;
  const priceUsd = runeMarketData.current_price.usd;

  // SET DATA
  await set('pools', poolList);
  Object.keys(poolDetails).forEach(async (poolId) => {
    await set(`pools-${poolId}`, poolDetails[poolId]);
  })
  await set('nodeAccounts', nodeAccountsWithLocation);
  await set('lastBlock', lastBlock);
  await set('mimir', mimir);
  await set('asgardVaults', asgardVaults);
  await set('poolAddresses', poolAddresses);
  await set('binanceChain', binanceChain);
  await set('stats', stats);
  await set('network', network);
  await set('constants', constants);
  await set('version', versionRequest.data);
  await set('marketData', { priceUsd: priceUsd.toString(), circulating });
  await set('runevaultBalance', runevaultBalance);

  const end = new Date()
  console.log(`[${blockchain}]: ended data fetch in ${(end - start) / 1000} seconds...`)
}

async function fetchDataJob(blockchain) {
  const dataSource = process.env.DATA_SOURCE;
  if(dataSource !== "api") {
    console.log('DATA_SOURCE env variable should be set to \"api\" to run this job');
    return;
  }

  let timeout = 1000
  try {
    await updateBlockchainData(blockchain);
  } catch(e) {
    console.log(`[${blockchain}]: Data fetch failed with: `, e);
    timeout = 5000;
  }

  setTimeout(() => {
    fetchDataJob(blockchain);
  }, timeout);
}

fetchDataJob('testnet');
fetchDataJob('chaosnet');
