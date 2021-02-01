import axios from 'axios';
import { thorchainDataFetcher } from '../lib/thorchainUrls.mjs';
import { binanceFetchAccounts } from '../lib/binanceApi.mjs';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';
import redisClient from '../lib/redisClient.mjs';
import EmailProvider from '../lib/emailProvider.mjs';


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
  const api = thorchainDataFetcher(blockchain);

  // FETCH DATA
  // Thorchain
  const poolList = await api.loadPools();
  // NOTE: v1 returned status: 'Enabled'
  //       v2 thorchain is returning status: Available
  //       v2 midgard is returning status available
  const okStatus = 'available';
  const poolIds = poolList.filter(i => (i.status || '').toLowerCase() === okStatus).map(i => i.asset);
  const poolStats = {};
  const poolHistoryDepths = {};
  const poolHistorySwaps = {};
  for (const poolId of poolIds) {
    // NOTE: in v2  poolDetail is an object with this shape of string values:
    //       { period1h, period24h, period7d, period30d, period90d, period365d, periodAll }
    const poolDetail = await api.loadPoolStats(poolId);
    poolStats[poolId] = poolDetail;
    const poolHD = await api.loadHistoryDepths(poolId);
    poolHistoryDepths[poolId] = poolHD;
    const poolHS = await api.loadHistorySwaps(poolId);
    poolHistorySwaps[poolId] = poolHS;
    
  }
  const nodeAccounts = await api.loadNodeAccounts();
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => lookupGeoIP(nodeAccount['ip_address']));
    return { ...nodeAccount, location: lookup };
  }));
  const lastBlock = await api.loadLastBlock();
  const mimir = await api.loadMimir();
  const asgardVaults = await api.loadAsgardVaults();
  const inboundAddresses = await api.loadInboundAddresses();
  const stats = await api.loadStats(); // NOTE: same as v1 without : [poolCount, totalEarned, totalVolume24hr]
  // IMPORTANT NOTE: disabling network since its failing
  const network = await api.loadNetwork(); // NOTE: v2 same props changed standbyNodeCount is str, totalPooledRune, totalStaked
  const constants = await api.loadConstants(); // same, some props updated?
  const versionRequest = await api.loadNodeVersion();

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
  const binancePoolAddressData = inboundAddresses.current.find(a => a.chain === 'BNB');
  let binanceCachedAddresses = await redisClient.lrangeAsync(redisKey(`asgardAddresses::BNB`), 0, 3);
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
  Object.keys(poolStats).forEach(async (poolId) => {
    await set(`pools-${poolId}`, poolStats[poolId]);
  });
  await set('poolHistoryDepths', poolHistoryDepths);
  await set('poolHistorySwaps', poolHistorySwaps);
  await set('nodeAccounts', nodeAccountsWithLocation);
  await set('lastBlock', lastBlock);
  await set('mimir', mimir);
  await set('asgardVaults', asgardVaults);
  
  // Keep a list of most recent asgard vault addresses
  inboundAddresses.current.forEach(async (addressData) => {
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
  await set('version', versionRequest);
  await set('marketData', { priceUsd: priceUsd.toString(), circulating });
  await set('runevaultBalance', runevaultBalance);
  await set('binanceAccounts', binanceAccounts);

  const end = new Date();
  console.log(`[${blockchain}]: ended data fetch in ${(end - start) / 1000} seconds...`);
}

let consecutiveErrorAttempts = 0;
let notificationSent = false;
const NOTIFICATION_MINUTE_TIME_INTERVAL = process.env.NOTIFICATION_MINUTE_TIME_INTERVAL || 30;
async function fetchDataJob(blockchain) {
  let timeout = 1000
  try {
    await updateBlockchainData(blockchain);
    if (consecutiveErrorAttempts > 0) consecutiveErrorAttempts = 0;
  } catch (e) {
    const errorIntervalInSeconds = 5;
    consecutiveErrorAttempts += 1;
    const consecutiveErrorMinutes = Math
      .floor(((consecutiveErrorAttempts * errorIntervalInSeconds) / 60));
    if (consecutiveErrorMinutes > NOTIFICATION_MINUTE_TIME_INTERVAL || !notificationSent) {
      const sendgrid = EmailProvider();
      await sendgrid.sendErrorMail(e, blockchain);
      notificationSent = true;
    }
    console.log(`[${blockchain}]: Data fetch failed with: `, e);
    timeout = 5000;
  }
  setTimeout(() => {
    fetchDataJob(blockchain);
  }, timeout);
}

fetchDataJob('testnet');

// NOTE: no chaosnet on v2 testnet, so no fetch data for it for now
// fetchDataJob('chaosnet');
