import { loadPools, loadPoolDetail, loadNodeAccounts, loadLastBlock, loadMimir, loadAsgardVaults, loadConstants, loadStats, loadNetwork } from '../lib/api.mjs';
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

async function set(key, data) {
  await setAsync(key, JSON.stringify(data));
}

async function getRunePrice() {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
  return response.data.market_data.current_price.usd;
}

async function run() {
  const poolIds = await loadPools({ axios });
  await set('pools', poolIds);

  for (const poolId of poolIds) {
    const poolDetail = await loadPoolDetail({ axios, poolId });
    await set(`pools-${poolId}`, poolDetail);
  }

  const nodeAccounts = await loadNodeAccounts({ axios });
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => {
      return await lookupGeoIP(nodeAccount['ip_address']);
    });
    return { ...nodeAccount, location: lookup };
  }));
  await set('nodeAccounts', nodeAccountsWithLocation);

  const lastBlock = await loadLastBlock({ axios });
  await set('lastBlock', lastBlock);

  const mimir = await loadMimir({ axios });
  await set('mimir', mimir);

  const asgardVaults = await loadAsgardVaults({ axios });
  await set('asgardVaults', asgardVaults);

  const stats = await loadStats({ axios });
  await set('stats', stats);

  const network = await loadNetwork({ axios });
  await set('network', network);

  const constants = await loadConstants({ axios });
  await set('constants', constants);

  const totalStaked = parseInt(stats.totalStaked);
  const totalBonded = Object.values(nodeAccounts).reduce((total, node) => (
    total + parseInt(node.bond)
  ), 0);
  const circulating = ((totalBonded + totalStaked) / (10 ** 8)).toFixed(2);

  const priceUsd = await getRunePrice();
  await set('marketData', { priceUsd: priceUsd.toString(), circulating });

  client.unref();
  process.exit();
}

run();
