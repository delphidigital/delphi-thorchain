import express from 'express';
import { promisify } from 'util';
import redisClient from '../lib/redisClient.mjs';

const client = redisClient;
const getAsync = promisify(client.get).bind(client);

const app = express();
const thorchain = express.Router();
const chaosnet = express.Router();
const testnet = express.Router();

async function loadCached(id) {
  const rawdata = await getAsync(`thorchain::${id}`);
  return JSON.parse(rawdata);
}

thorchain.all('/overview', async (req, res) => {
  const rawPriceData = await getAsync(`thorchain::rune_1y_daily_prices`);
  const runePrices = rawPriceData ? JSON.parse(rawPriceData) : {};
  const pools = await loadCached(`${req.blockchain}::pools`) || [];
  const nodes = await loadCached(`${req.blockchain}::nodeAccounts`);
  const lastBlock = await loadCached(`${req.blockchain}::lastBlock`);
  const mimir = await loadCached(`${req.blockchain}::mimir`);
  const asgardVaults = await loadCached(`${req.blockchain}::asgardVaults`);
  const network = await loadCached(`${req.blockchain}::network`);
  const market = await loadCached(`${req.blockchain}::marketData`);
  const constants = await loadCached(`${req.blockchain}::constants`);
  const runevaultBalance = await loadCached(`${req.blockchain}::runevaultBalance`);

  const version = await loadCached(`${req.blockchain}::version`);
  const binanceAccounts = await loadCached(`${req.blockchain}::binanceAccounts`);

  const technicalAnalysis = await loadCached(`${req.blockchain}::technicalAnalysis`);

  // NOTE: stats payload not used by frontend
  // const stats = await loadCached(`${req.blockchain}::stats`);

  // NOTE: provide by default all available pools info in advance
  const poolIds = pools.filter(i => (i.status || '').toLowerCase() === 'available').map(i => i.asset);
  const availablePoolStats = await Promise.all(poolIds.map(async (poolId) => {
    const poolStats = await loadCached(`${req.blockchain}::pools-${poolId}`);
    return { poolId, poolStats };
  }));
  const availablePoolHistoryDepths = await loadCached(`${req.blockchain}::poolHistoryDepths`);
  const availablePoolHistorySwaps = await loadCached(`${req.blockchain}::poolHistorySwaps`);

  res.json({
    pools,
    nodes,
    lastBlock,
    mimir,
    asgardVaults,
    network,
    market,
    constants,
    runevaultBalance,
    version,
    binanceAccounts,
    availablePoolStats,
    availablePoolHistoryDepths,
    availablePoolHistorySwaps,
    runePrices,
    technicalAnalysis,
  });
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
