import { loadPools, loadPoolDetail, loadNodeAccounts, loadStats } from '../lib/api.mjs';
import axios from 'axios';
import fs from 'fs';

async function run() {
  const poolIds = await loadPools({ axios });
  console.log(poolIds);
  fs.writeFileSync('stubs/pools.json', JSON.stringify(poolIds));

  for (const poolId of poolIds) {
    const poolDetail = await loadPoolDetail({ axios, poolId });
    fs.writeFileSync(`stubs/pools-${poolId}.json`, JSON.stringify(poolDetail));
  }

  const nodeAccounts = await loadNodeAccounts({ axios });
  fs.writeFileSync('stubs/nodeAccounts.json', JSON.stringify(nodeAccounts));

  const stats = await loadStats({ axios });
  fs.writeFileSync('stubs/stats.json', JSON.stringify(stats));
}

run();
