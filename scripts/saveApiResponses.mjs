import { loadPools, loadPoolDetail, loadNodeAccounts, loadStats } from '../lib/api.mjs';
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

async function run() {
  const poolIds = await loadPools({ axios });
  await set('pools', poolIds);

  for (const poolId of poolIds) {
    const poolDetail = await loadPoolDetail({ axios, poolId });
    await set(`pools-${poolId}`, poolDetail);
  }

  const nodeAccounts = await loadNodeAccounts({ axios });
  await set('nodeAccounts', nodeAccounts);

  const stats = await loadStats({ axios });
  await set('stats', stats);

  client.unref();
}

run();
