import express from 'express';
import fs from 'fs';
import redis from 'redis';
import { promisify } from 'util';

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

const app = express();
const thorchain = express.Router();
const chaosnet = express.Router();
const testnet = express.Router();

async function loadCached(id) {
  const rawdata = await getAsync(`thorchain::${id}`);
  return JSON.parse(rawdata);
}


thorchain.all('/v1/pools', async (req, res) => {
  const data = await loadCached(`${blockchain}::pools`);
  res.json(data);
});

thorchain.all('/v1/pools/detail', async (req, res) => {
  const data = await loadCached(`${blockchain}::pools-${req.query.asset}`);
  res.json(data);
});

thorchain.all('/v1/stats', async (req, res) => {
  const data = await loadCached(`${blockchain}::stats`);
  res.json(data);
});

thorchain.all('/v1/network', async (req, res) => {
  const data = await loadCached(`${blockchain}::network`);
  res.json(data);
});

thorchain.all('/v1/thorchain/constants', async (req, res) => {
  const data = await loadCached(`${blockchain}::constants`);
  res.json(data);
});

thorchain.all('/thorchain/nodeaccounts', async (req, res) => {
  const data = await loadCached(`${blockchain}::nodeAccounts`);
  res.json(data);
});

thorchain.all('/thorchain/mimir', async (req, res) => {
  const data = await loadCached(`${blockchain}::mimir`);
  res.json(data);
});

thorchain.all('/thorchain/pool_addresses', async (req, res) => {
  const data = await loadCached(`${blockchain}::poolAddresses`);
  res.json(data);
});

thorchain.all('/thorchain/lastblock', async (req, res) => {
  const data = await loadCached(`${blockchain}::lastBlock`);
  res.json(data);
});

thorchain.all('/thorchain/vaults/asgard', async (req, res) => {
  const data = await loadCached(`${blockchain}::asgardVaults`);
  res.json(data);
});

app.all('/int/marketdata', async (req, res) => {
  const data = await loadCached('marketData');
  res.json(data);
});

app.use('/chaosnet', chaosnet);
app.use('/testnet', testnet);

chaosnet.use((req, res, next) => {
  req.blockchain = 'chaosnet';
  next();
});
chaosnet.use('/', thorchain);

testnet.use((req, res, next) => {
  req.blockchain = 'testnet';
  next();
});
testnet.use('/', thorchain);

app.use('/chaosnet', chaosnet);
app.use('/testnet', testnet);

module.exports = {
  handler: app,
};
