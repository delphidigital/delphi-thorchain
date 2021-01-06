import axios from 'axios';
import ThorchainApi from '../lib/api.mjs';
import { binanceFetchAccounts } from '../lib/binanceApi.mjs';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';
import redisClient from '../lib/redisClient.mjs';
import sendgrid from '../lib/sendgrid.mjs';


process.on('unhandledRejection', (up) => { throw up; });
async function redisSet(key, data) {
  await redisClient.setAsync(key, JSON.stringify(data));
}
async function getRuneMarketData() {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
  return response.data.market_data;
}

async function updateBlockchainData(blockchain) {
  const start = new Date();
  console.log(`[${blockchain}]: starting data fetch...`);
  const redisKey = key => `thorchain::${blockchain}::${key}`;
  const set = (key, data) => redisSet(redisKey(key), data);
  const api = ThorchainApi(blockchain);

  // FETCH DATA
  // Thorchain
  const poolList = await api.loadPools({ axios });
  const poolIds = poolList.filter(i => i.status === 'Enabled').map(i => i.asset);
  const poolDetails = {};
  for (const poolId of poolIds) {
    const poolDetail = await api.loadPoolDetail({ axios, poolId });
    poolDetails[poolId] = poolDetail;
  }
  const nodeAccounts = await api.loadNodeAccounts({ axios });
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => lookupGeoIP(nodeAccount['ip_address']));
    return { ...nodeAccount, location: lookup };
  }));
  const lastBlock = await api.loadLastBlock({ axios });
  const mimir = await api.loadMimir({ axios });
  const asgardVaults = await api.loadAsgardVaults({ axios });
  const poolAddresses = await api.loadPoolAddresses({ axios });
  const stats = await api.loadStats({ axios });
  const network = await api.loadNetwork({ axios });
  const constants = await api.loadConstants({ axios });
  const versionRequest = await axios.get(`${api.nodeUrl()}/thorchain/version`);

  // Other sources
  const runeMarketData = await getRuneMarketData();
  let runevaultBalance = 0;
  if (blockchain === 'chaosnet') {
    const frozenBalancesReq = await axios.get('http://frozenbalances.herokuapp.com/stats/RUNE-B1A');
    runevaultBalance = frozenBalancesReq.data.totalFrozen;
  }
  // Get Binance accounts
  // only query as many as there are asgard vaults
  const asgardVaultsCount = asgardVaults.length;
  const binancePoolAddressData = poolAddresses.current.find(a => a.chain === 'BNB');
  const binanceCachedAddresses = await redisClient.lrangeAsync(redisKey('asgardAddresses::BNB'), 0, 3);
  if (binancePoolAddressData) {
    binanceCachedAddresses.unshift(binancePoolAddressData.address);
  }
  const binanceAddresses = [];
  for (
    let i = 0;
    (i < binanceCachedAddresses.length) && (binanceAddresses.length < asgardVaultsCount);
    i++) {
    const address = binanceCachedAddresses[i];
    if (!binanceAddresses.includes(address)) {
      binanceAddresses.push(address);
    }
  }
  const binanceAccounts = await binanceFetchAccounts({ axios }, blockchain, binanceAddresses);

  // PROCESS RESULTS
  const totalStaked = parseInt(stats.totalStaked);
  const totalBonded = Object.values(nodeAccounts).reduce((total, node) => (
    total + parseInt(node.bond)
  ), 0);
  const circulating = blockchain === 'testnet' ?
    ((totalBonded + totalStaked) / (10 ** 8)).toFixed(2) : runeMarketData.circulating_supply;
  const priceUsd = runeMarketData.current_price.usd;

  // SET DATA
  await set('pools', poolList);
  Object.keys(poolDetails).forEach(async (poolId) => {
    await set(`pools-${poolId}`, poolDetails[poolId]);
  });
  await set('nodeAccounts', nodeAccountsWithLocation);
  await set('lastBlock', lastBlock);
  await set('mimir', mimir);
  await set('asgardVaults', asgardVaults);
  // Keep a list of most recent asgard vault addresses
  poolAddresses.current.forEach(async (addressData) => {
    const chain = addressData.chain;
    const address = addressData.address;
    const key = redisKey(`asgardAddresses::${chain}`);
    // Always keep the address returned at pool_addresses first, does not matter if it
    // repeats in the list as long as they are not consecutive
    const currentAddress = await redisClient.lindexAsync(key, 0);
    if (address !== currentAddress) {
      await redisClient.lpushAsync(key, address);
      // TODO(elfedy): Keep four addresses just in case. Maybe more in the future when we
      // have multiple Asgard vaults
      await redisClient.ltrimAsync(key, 0, 3);
    }
  });

  await set('stats', stats);
  await set('network', network);
  await set('constants', constants);
  await set('version', versionRequest.data);
  await set('marketData', { priceUsd: priceUsd.toString(), circulating });
  await set('runevaultBalance', runevaultBalance);
  await set('binanceAccounts', binanceAccounts);

  const end = new Date();
  console.log(`[${blockchain}]: ended data fetch in ${(end - start) / 1000} seconds...`);
}

async function fetchDataJob(blockchain) {
  const dataSource = process.env.DATA_SOURCE;
  if (dataSource !== 'api') {
    console.log('DATA_SOURCE env variable should be set to "api" to run this job');
    return;
  }
  let timeout = 1000;
  try {
    await updateBlockchainData(blockchain);
  } catch (e) {
    console.log(`[${blockchain}]: Data fetch failed with: `, e);
    await sendgrid.sendErrorEmail(e, blockchain);
    timeout = 5000;
  }
  setTimeout(() => {
    fetchDataJob(blockchain);
  }, timeout);
}

fetchDataJob('testnet');
fetchDataJob('chaosnet');
