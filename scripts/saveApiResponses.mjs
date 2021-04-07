import axios from 'axios';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import { thorchainDataFetcher } from '../lib/thorchainUrls.mjs';
import { binanceFetchAccounts } from '../lib/binanceApi.mjs';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';
import redisClient from '../lib/redisClient.mjs';
import EmailProvider from '../lib/emailProvider.mjs';

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Utility methods for rune value parsing
const runeDivider = 10 ** 8;
const runeE8toValue = runeString => (runeString ? (parseFloat(runeString) / runeDivider) : 0);

process.on('unhandledRejection', (up) => { throw up; });
async function redisSet(key, data) {
  await redisClient.setAsync(key, JSON.stringify(data));
}
async function getRuneMarketData(blockchain) {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/thorchain?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
  let circulating_supply = response.data.market_data.circulating_supply;
  if (blockchain === 'testnet') {
    const cirqSupplyResponse = await getTestnetV2CirqSupply();
    circulating_supply = parseInt(cirqSupplyResponse.supply.find(item => (
      item.denom === 'rune'
    )).amount || 0, 10) / 10**8;
    console.warn('CIRQ SUPPLY', circulating_supply);
  }
  return {
    total_supply: response.data.market_data.total_supply,
    max_supply: response.data.market_data.max_supply,
    circulating_supply,
  };
}

// TODO: use this value as placeholder for cirq supply until v2 api cirq supply is released
async function getTestnetV2CirqSupply() {
  const response = await axios.get('https://testnet.thornode.thorchain.info/cosmos/bank/v1beta1/supply');
  return { supply: response.data.supply };
}

async function updateBlockchainData(blockchain) {
  const start = new Date();
  console.log(`[${blockchain}]: starting data fetch...`);
  const redisKey = key => `thorchain::${blockchain}::${key}`;
  const set = (key, data) => redisSet(redisKey(key), data);
  const api = thorchainDataFetcher(blockchain);

  // FETCH DATA
  // Thorchain
  const queue = await api.loadQueue();
  const poolList = await api.loadPools();
  // NOTE: v1 returned status: 'Enabled'
  //       v2 thorchain is returning status: Available
  //       v2 midgard is returning status available
  const okStatus = 'available';
  const poolIds = poolList.filter(i => (i.status || '').toLowerCase() === okStatus).map(i => i.asset);
  const poolStats = {};
  const poolHistoryDepths = {};
  const poolHistorySwaps = {};
  // this brings all pools history earnings
  const allPoolsHistoryEarnings = await api.loadHistoryEarnings();
  for (const poolId of poolIds) {
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
  const network = await api.loadNetwork(); // NOTE: v2 same props changed standbyNodeCount is str, totalPooledRune, totalStaked
  const constants = await api.loadConstants(); // same, some props updated?
  const versionRequest = await api.loadNodeVersion();

  // Other sources
  let runevaultBalance = 0;
  if (blockchain === 'chaosnet') {
    const frozenBalancesReq = await axios.get('http://frozenbalances.herokuapp.com/stats/RUNE-B1A');
    runevaultBalance = frozenBalancesReq.data.totalFrozen;
  }
  // Get Binance accounts
  // only query as many as there are asgard vaults

  const asgardVaultsCount = asgardVaults.length;
  const binancePoolAddressData = inboundAddresses.find(a => a.chain === 'BNB');
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
  const runeDepth = parseInt(stats.runeDepth);
  const totalBonded = Object.values(nodeAccounts).reduce((total, node) => (
    total + parseInt(node.bond)
  ), 0);

  const totalValueLockedUSD = (((runeDepth * 2) + totalBonded) /  (10 ** 8));
  const priceUsd = stats.runePriceUSD;
  const coingeckoMarketData = await getRuneMarketData(blockchain);
  // const ta = technicalAnalysis(
  //   poolStats, poolHistoryDepths, poolHistorySwaps, allPoolsHistoryEarnings,
  // );
  // TODO: Replace circulating calc (which is incomplete) with the circ supply endpoint when ready
  // const circulating = ((totalBonded + runeDepth) / (10 ** 8));
  const circulating = coingeckoMarketData.circulating_supply; // ((totalBonded + runeDepth) / (10 ** 8));

  // SET DATA
  await set('queue', queue);
  await set('pools', poolList);
  Object.keys(poolStats).forEach(async (poolId) => {
    await set(`pools-${poolId}`, poolStats[poolId]);
  });
  await set('allPoolsHistoryEarnings', allPoolsHistoryEarnings);
  await set('poolHistoryDepths', poolHistoryDepths);
  await set('poolHistorySwaps', poolHistorySwaps);
  await set('nodeAccounts', nodeAccountsWithLocation);
  await set('lastBlock', lastBlock);
  await set('mimir', mimir);
  await set('asgardVaults', asgardVaults);
  // await set('technicalAnalysis', ta);
  
  // Keep a list of most recent asgard vault addresses
  inboundAddresses.forEach(async (addressData) => {
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
  await set('marketData', { priceUsd: priceUsd.toString(), circulating, totalValueLockedUSD, coingeckoMarketData });
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
    timeout = 100000;
  } finally {
    setTimeout(() => {
      fetchDataJob(blockchain);
    }, timeout);
  }
}

async function main() {
  await fetchDataJob('chaosnet');
  await fetchDataJob('testnet');
}
main();