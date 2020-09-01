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

thorchain.all('/thorchain/pools', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::pools`);
  res.json(data);
});

thorchain.all('/v1/pools/detail', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::pools-${req.query.asset}`);
  res.json(data);
});

thorchain.all('/v1/stats', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::stats`);
  res.json(data);
});

thorchain.all('/v1/network', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::network`);
  res.json(data);
});

thorchain.all('/v1/thorchain/constants', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::constants`);
  res.json(data);
});

thorchain.all('/thorchain/nodeaccounts', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::nodeAccounts`);
  res.json(data);
});

thorchain.all('/thorchain/mimir', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::mimir`);
  res.json(data);
});

thorchain.all('/thorchain/pool_addresses', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::poolAddresses`);
  res.json(data);
});

thorchain.all('/thorchain/lastblock', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::lastBlock`);
  res.json(data);
});

thorchain.all('/thorchain/vaults/asgard', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::asgardVaults`);
  res.json(data);
});

thorchain.all('/int/marketdata', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::marketData`);
  res.json(data);
});

thorchain.all('/int/runevaultBalance', async (req, res) => {
  const data = await loadCached(`${req.blockchain}::runevaultBalance`);
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
