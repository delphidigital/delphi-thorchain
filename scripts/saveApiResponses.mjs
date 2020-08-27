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

async function getRunePrice() {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
  return response.data.market_data.current_price.usd;
}

async function updateBlockchainData(blockchain) {
  const start = new Date();
  console.log(`[${blockchain}]: starting data fetch...`)
  const set = (key, data) => redisSet(`thorchain::${blockchain}::${key}`, data);
  const api = ThorchainApi(blockchain);

  const poolIds = await api.loadPools({ axios });
  await set('pools', poolIds);

  for (const poolId of poolIds) {
    const poolDetail = await api.loadPoolDetail({ axios, poolId });
    await set(`pools-${poolId}`, poolDetail);
  }

  const nodeAccounts = await api.loadNodeAccounts({ axios });
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => {
      return await lookupGeoIP(nodeAccount['ip_address']);
    });
    return { ...nodeAccount, location: lookup };
  }));
  await set('nodeAccounts', nodeAccountsWithLocation);

  const lastBlock = await api.loadLastBlock({ axios });
  await set('lastBlock', lastBlock);

  const mimir = await api.loadMimir({ axios });
  await set('mimir', mimir);

  const asgardVaults = await api.loadAsgardVaults({ axios });
  await set('asgardVaults', asgardVaults);

  const poolAddresses = await api.loadPoolAddresses({ axios });
  await set('poolAddresses', poolAddresses);

  const binanceChain = await loadBinanceChain({ axios }, blockchain);
  await set('binanceChain', binanceChain);

  const stats = await api.loadStats({ axios });
  await set('stats', stats);

  const network = await api.loadNetwork({ axios });
  await set('network', network);

  const constants = await api.loadConstants({ axios });
  await set('constants', constants);

  const totalStaked = parseInt(stats.totalStaked);
  const totalBonded = Object.values(nodeAccounts).reduce((total, node) => (
    total + parseInt(node.bond)
  ), 0);
  const circulating = ((totalBonded + totalStaked) / (10 ** 8)).toFixed(2);

  const priceUsd = await getRunePrice();
  await set('marketData', { priceUsd: priceUsd.toString(), circulating });

  const end = new Date()
  console.log(`[${blockchain}]: ended data fetch in ${(end - start) / 1000} seconds...`)
}

async function run() {
  const now = new Date();
  console.log('Fetching new thorchain data at: ', now);

  const dataSource = process.env.DATA_SOURCE;
  if(dataSource !== "api") {
    console.log('DATA_SOURCE env variable should be set to \"api\" to run this job');
    return;
  }

  await Promise.all([
    updateBlockchainData('testnet'),
    updateBlockchainData('chaosnet'),
  ]);

  const end = new Date();
  console.log(`Finished updating in ${(end - now) / 1000} seconds`);

  setTimeout(() => {
    run();
  }, 1000);
}

run();
