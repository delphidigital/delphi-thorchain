import { loadPools, loadPoolDetail, loadNodeAccounts, loadLastBlock, loadConstants, loadStats } from '../lib/api.mjs';
import axios from 'axios';
import fs from 'fs';
import redis from 'redis';
import { promisify } from 'util';
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
  await set('nodeAccounts', nodeAccounts);

  const lastBlock = await loadLastBlock({ axios });
  await set('lastBlock', lastBlock);

  const stats = await loadStats({ axios });
  await set('stats', stats);

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
}

run();
