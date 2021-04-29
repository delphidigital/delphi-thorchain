import express from 'express';
import redisClient from '../lib/redisClient.mjs';

const app = express();
const thorchain = express.Router();
const chaosnet = express.Router();
const testnet = express.Router();

app.use(function(_req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

async function loadCached(id) {
  const rawdata = await redisClient.getAsync(`thorchain::${id}`);
  return JSON.parse(rawdata);
}

thorchain.all('/overview', async (req, res) => {
  const pools = await loadCached(`${req.blockchain}::pools`);
  // NOTE: provide by default all available pools info in advance
  const poolIds = pools.filter(i => (i.status || '').toLowerCase() === 'available').map(i => i.asset);
  const poolsPromises = poolIds.map((poolId) => (
    new Promise((res, rej) => (
      loadCached(`${req.blockchain}::pools-${poolId}`).then(poolStats => res({
        poolId, poolStats
      })).catch(rej)
    ))
  ));
  const payloadPromises = [
    loadCached(`${req.blockchain}::queue`),
    loadCached(`${req.blockchain}::nodeAccounts`),
    loadCached(`${req.blockchain}::lastBlock`),
    loadCached(`${req.blockchain}::mimir`),
    loadCached(`${req.blockchain}::asgardVaults`),
    loadCached(`${req.blockchain}::network`),
    loadCached(`${req.blockchain}::marketData`),
    loadCached(`${req.blockchain}::constants`),
    loadCached(`${req.blockchain}::runevaultBalance`),
    loadCached(`${req.blockchain}::v1SinglechainStats`),
    loadCached(`${req.blockchain}::v1SinglechainNetwork`),
    loadCached(`${req.blockchain}::taPeriods`),
    loadCached(`${req.blockchain}::version`),
    loadCached(`${req.blockchain}::binanceAccounts`),
    loadCached(`${req.blockchain}::stats`),
    loadCached(`${req.blockchain}::poolHistoryDepths`),
    loadCached(`${req.blockchain}::poolHistorySwaps`),
    loadCached(`${req.blockchain}::allPoolsHistoryEarnings`),
    loadCached(`${req.blockchain}::chainBalances`),
    ...poolsPromises,
  ];
  const [
    queue,
    nodes,
    lastBlock,
    mimir,
    asgardVaults,
    network,
    market,
    constants,
    runevaultBalance,
    v1SinglechainStats,
    v1SinglechainNetwork,
    taPeriods,
    version,
    binanceAccounts,
    stats,
    availablePoolHistoryDepths,
    availablePoolHistorySwaps,
    allPoolsHistoryEarnings,
    chainBalances,
    ...availablePoolStats
  ] = await Promise.all(payloadPromises);
  res.json({
    queue: queue || {},
    pools: pools || [],
    stats,
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
    taPeriods,
    allPoolsHistoryEarnings,
    v1SinglechainStats,
    v1SinglechainNetwork,
    chainBalances,
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
