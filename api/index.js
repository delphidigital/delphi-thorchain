import express from 'express';
import fs from 'fs';
import redis from 'redis';
import { promisify } from 'util';
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

const app = express();

async function loadCached(id) {
  const rawdata = await getAsync(id);
  return JSON.parse(rawdata);
}

app.all('/v1/pools', async (req, res) => {
  const data = await loadCached('pools');
  res.json(data);
});

app.all('/v1/pools/detail', async (req, res) => {
  const data = await loadCached(`pools-${req.query.asset}`);
  res.json(data);
});

app.all('/v1/stats', async (req, res) => {
  const data = await loadCached('stats');
  res.json(data);
});

app.all('/v1/thorchain/constants', async (req, res) => {
  const data = await loadCached('constants');
  res.json(data);
});

app.all('/thorchain/nodeaccounts', async (req, res) => {
  const data = await loadCached('nodeAccounts');
  res.json(data);
});

app.all('/thorchain/lastblock', async (req, res) => {
  const data = await loadCached('lastBlock');
  res.json(data);
});

app.all('/int/marketdata', async (req, res) => {
  const data = await loadCached('marketData');
  res.json(data);
});

module.exports = {
  handler: app,
};
