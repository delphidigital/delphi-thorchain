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
    circulating_supply = cirqSupplyResponse.supply.reduce((acc, next) => (
      acc + parseInt(next.amount, 10)
    ),0) / 10**8;
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

// History depth and swaps contain this keys: 
function technicalAnalysis(
  poolStats, historyDepth, historySwaps, allPoolsHistoryEarnings,
) {
  const technicalAnalysisCache = {};
  // TA from historySwaps payload
  Object.keys(historySwaps).forEach(poolId => {
    Object.keys(historySwaps[poolId]).forEach(periodKey => {
      const runeUSDPrices = {};
      historyDepth[poolId][periodKey].intervals.forEach(i => {
        const assetPriceUSD = parseFloat(i.assetPriceUSD);
        const assetPrice = parseFloat(i.assetPrice);
        runeUSDPrices[i.startTime] = isNaN(assetPriceUSD) || isNaN(assetPrice) || !assetPrice
          ? 0
          : assetPriceUSD/assetPrice;
      });
      // { intervals: any[], meta: { endTime: string; startTime: string; }}
      const { intervals } = historySwaps[poolId][periodKey];
      const totalVolume = intervals.reduce((result, item) => (
        result + runeE8toValue(item.totalVolume)
      ), 0);
      const volumeAverage = (totalVolume / intervals.length);
      const totalVolumeUsd = intervals.reduce((result, item) => {
        const runePriceUsd = runeUSDPrices[item.startTime] || 0;
        return (result + (runeE8toValue(item.totalVolume)*runePriceUsd));
      }, 0);
      const intervalSwaps = {};
      intervals.forEach(interval => {
        const runePriceUsd = runeUSDPrices[interval.startTime] || 0;
        intervalSwaps[interval.startTime] = {
          totalVolumeUsd: runeE8toValue(interval.totalVolume) * runePriceUsd,
          startTime: interval.startTime
        };
      })
      const volumeAverageUsd = totalVolumeUsd/intervals.length;
      if (technicalAnalysisCache[poolId] === undefined) {
        technicalAnalysisCache[poolId] = {};
      }
      if (technicalAnalysisCache[poolId][periodKey] === undefined) {
        technicalAnalysisCache[poolId][periodKey] = {};
      }
      technicalAnalysisCache[poolId][periodKey].intervalSwaps = intervalSwaps;
      technicalAnalysisCache[poolId][periodKey].totalVolume = totalVolume;
      technicalAnalysisCache[poolId][periodKey].volumeAverage = volumeAverage;  
      technicalAnalysisCache[poolId][periodKey].totalVolumeUsd = totalVolumeUsd;
      technicalAnalysisCache[poolId][periodKey].volumeAverageUsd = volumeAverageUsd;
    });
  });

  // TA from historyDepth payload
  Object.keys(historyDepth).forEach(poolId => {
    Object.keys(historyDepth[poolId]).forEach(periodKey => {
      // { intervals: any[], meta: { endTime: string; startTime: string; }}
      const { intervals } = historyDepth[poolId][periodKey];
      const totalDepth = intervals.reduce((result, item) => (
        result + (runeE8toValue(item.runeDepth) * 2)
      ), 0);
      const depthAverage = (totalDepth / intervals.length);
      const totalDepthUsd = intervals.reduce((result, item) => {
        const assetPriceUSD = parseFloat(item.assetPriceUSD);
        const assetPrice = parseFloat(item.assetPrice);
        const runePriceUsd = isNaN(assetPriceUSD) || isNaN(assetPrice) ? 0 : assetPriceUSD/assetPrice;
        return (result + (runeE8toValue(item.runeDepth)*2*runePriceUsd));
      }, 0);
      const depthAverageUsd = totalDepthUsd/intervals.length;
      if (technicalAnalysisCache[poolId] === undefined) {
        technicalAnalysisCache[poolId] = {};
      }
      if (technicalAnalysisCache[poolId][periodKey] === undefined) {
        technicalAnalysisCache[poolId][periodKey] = {};
      }
      technicalAnalysisCache[poolId][periodKey].totalDepth = totalDepth;
      technicalAnalysisCache[poolId][periodKey].depthAverage = depthAverage;
      technicalAnalysisCache[poolId][periodKey].totalDepthUsd = totalDepthUsd;
      technicalAnalysisCache[poolId][periodKey].depthAverageUsd = depthAverageUsd;
      // need intervals sorted since the first interval is used as reference for the price swing
      const sortedIntervals = intervals.sort((a,b) => parseInt(a.startTime, 10) - parseInt(b.startTime, 10));
      const intervalsCalculations = {};
      let firstIntervalTimestamp = 0;
      sortedIntervals.forEach((interval, idx) => {
        // NOTE: each interval is like:
        // {
        //   assetDepth: "0"
        //   assetPrice: "0"
        //   assetPriceUSD: "99.1302878324524",
        //   endTime: "1609977600"
        //   runeDepth: "0"
        //   startTime: "1609891200"
        // }
        const assetPriceUsd = parseFloat(interval.assetPriceUSD);
        const assetPrice = parseFloat(interval.assetPrice);
        const runePriceUsd = isNaN(assetPriceUsd) || isNaN(assetPrice) ? 0 : assetPriceUsd/assetPrice;
        const runeAssetRatio = interval.assetPriceUsd
          ? (interval.runePriceUsd) / (interval.assetPriceUsd)
          : 0

        let priceSwing = 0.0;
        let impermanentLoss = 0.0;
        if (idx === 0) {
          firstIntervalTimestamp = interval.startTime;
        } else {
          // use runeAssetRatio from first interval value for price swing
          const firstIntervalRuneAssetRatio = intervalsCalculations[firstIntervalTimestamp].runeAssetRatio
          priceSwing = firstIntervalRuneAssetRatio
            ? ((runeAssetRatio / firstIntervalRuneAssetRatio)-1)
            : 0;
          impermanentLoss = (
            (2 * Math.sqrt(1+priceSwing) / (2+priceSwing)) - 1
          );
        }
        let periodRuneEarnings = 0.0;
        let periodUsdEarnings = 0.0;
        let periodicRate = 0.0;
        let periodAPY = 0.0;
        if (allPoolsHistoryEarnings[periodKey] && allPoolsHistoryEarnings[periodKey].meta?.pools) {
          const intervalEarnings = allPoolsHistoryEarnings[periodKey].intervals.find(earningsInterval => (
            earningsInterval.startTime === interval.startTime
          ));
          if (intervalEarnings) {
            const poolPeriodEarnings = intervalEarnings.pools.find(pe => (pe.pool === poolId));
            if (poolPeriodEarnings) {
              periodRuneEarnings = runeE8toValue(poolPeriodEarnings.earnings);
              const intervalRuneDepth = runeE8toValue(interval.runeDepth);
              // periodUsdEarnings = periodRuneEarnings * runePriceUsd;
              // periodUsdEarnings = periodRuneEarnings;
              // https://www.investopedia.com/personal-finance/apr-apy-bank-hopes-cant-tell-difference/
              // Periodic Rate = (earnings - IL) / total Depth
              
              periodicRate = intervalRuneDepth
                // TODO: how to remove impermanent loss??!!
                ? (((periodRuneEarnings + (periodRuneEarnings * impermanentLoss))/(intervalRuneDepth*2)))
                // ? ((periodRuneEarnings/(intervalRuneDepth*2)))
                : 0;
              // APY = ((1 + Periodic Rate)^Number of periods) – 1
              // NOTE: this numberOfPeriods only works for daily intervals
              //       need to fix this for 24h period in hoours and
              //       for 6M and 1Y period in weeks
              let numberOfPeriods = 365;
              if (periodKey === 'period24H') {
                numberOfPeriods = 365 * 24;
              } else if (periodKey === 'allTimePeriod') {
                numberOfPeriods = 365 / differenceInDays(new Date(parseInt(interval.startTime,10)*1000), new Date(parseInt(interval.endTime,10)*1000))
              }
              // "APY= (1 + r )n – 1
              //   r = return over the specified period
              //   n = 365/days over which r is measured
              // https://learn.robinhood.com/articles/5CLrCuXmQXIKWMye3uZcEM/what-is-annual-percentage-yield-apy/
              periodAPY = (((1+(periodicRate/numberOfPeriods))**numberOfPeriods)-1) * 100;
            }
          }
        }
        intervalsCalculations[interval.startTime] = {
          assetPrice,
          assetPriceUsd,
          runePriceUsd,
          runeAssetRatio,
          startTime: interval.startTime,
          priceSwing,
          impermanentLoss: impermanentLoss * 100,
          periodRuneEarnings,
          // periodUsdEarnings,
          periodicRate,
          periodAPY,
        };
      });
      let averageRunePriceUsd = 0;
      let averageAssetPriceUsd = 0;
      let averageAssetPrice = 0;
      let averagePeriodAPY = 0;
      const intervalsCalculationsStartTimes = Object.keys(intervalsCalculations)
        .map(it => parseInt(it, 10))
        .sort();
      intervalsCalculationsStartTimes.forEach(startTimeKey => {
        averageRunePriceUsd += intervalsCalculations[startTimeKey].runePriceUsd;
        averageAssetPriceUsd += intervalsCalculations[startTimeKey].assetPriceUsd;
        averageAssetPrice += intervalsCalculations[startTimeKey].assetPrice;
        averagePeriodAPY += intervalsCalculations[startTimeKey].periodAPY;
      });
      averageRunePriceUsd = averageRunePriceUsd / intervalsCalculationsStartTimes.length;
      averageAssetPriceUsd = averageAssetPriceUsd / intervalsCalculationsStartTimes.length;
      averageAssetPrice = averageAssetPrice / intervalsCalculationsStartTimes.length;
      averagePeriodAPY = averagePeriodAPY / intervalsCalculationsStartTimes.length;
      technicalAnalysisCache[poolId][periodKey].averageRunePriceUsd = averageRunePriceUsd;
      technicalAnalysisCache[poolId][periodKey].averageAssetPriceUsd = averageAssetPriceUsd;
      technicalAnalysisCache[poolId][periodKey].averageAssetPrice = averageAssetPrice;
      technicalAnalysisCache[poolId][periodKey].averagePeriodAPY = averagePeriodAPY;
      let poolPeriodTotalEarningsRune = 0.0;
      let poolPeriodAverageEarningsRune = 0.0;
      if (allPoolsHistoryEarnings[periodKey] && allPoolsHistoryEarnings[periodKey].meta?.pools) {
        const poolEarnings = allPoolsHistoryEarnings[periodKey].meta.pools.find(p => p.pool === poolId);
        if (poolEarnings) {
          poolPeriodTotalEarningsRune = runeE8toValue(poolEarnings.earnings);
          poolPeriodAverageEarningsRune = poolPeriodTotalEarningsRune / intervals.length;
        }
      }
      technicalAnalysisCache[poolId][periodKey].totalEarningsRune = poolPeriodTotalEarningsRune;
      technicalAnalysisCache[poolId][periodKey].averageEarningsRune = poolPeriodAverageEarningsRune;
      
      // calculate total prices, deviation, correlation
      let sumSqrtAssetDeviation = 0.0;
      let sumSqrtRuneDeviation = 0.0;
      let sumSqrtAssetRuneDeviationMultiplied = 0.0;
      intervalsCalculationsStartTimes.forEach(startTimeKey => {
        intervalsCalculations[startTimeKey].assetPriceDeviation = (
          intervalsCalculations[startTimeKey].assetPriceUsd - averageAssetPriceUsd
        );
        intervalsCalculations[startTimeKey].runePriceDeviation = (
          intervalsCalculations[startTimeKey].runePriceUsd - averageRunePriceUsd
        );
        //  First, find the square of each daily deviation for each asset.
        const sqrtAssetDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].assetPriceDeviation)));
        const sqrtRuneDeviation = (Math.sqrt(Math.abs(intervalsCalculations[startTimeKey].runePriceDeviation)));
        sumSqrtAssetDeviation += sqrtAssetDeviation;
        sumSqrtRuneDeviation += sqrtRuneDeviation;
        // Then take this square daily deviation associated with the first asset for day one and multiply 
        // it by the square daily deviation for the second asset on day one
        sumSqrtAssetRuneDeviationMultiplied += (sqrtAssetDeviation * sqrtRuneDeviation)
      });
      // Take all of the squared daily deviations for asset one and add them together, before taking the square root of the sum
      const assetStandardDeviation = (Math.sqrt(sumSqrtAssetDeviation));
      const runeStandardDeviation = (Math.sqrt(sumSqrtRuneDeviation));
      // Then multiply the standard deviations for the two assets by one another, and put this number aside for the moment.
      const standardDeviationsMultiplied = assetStandardDeviation * runeStandardDeviation;
      const correllation = (Math.sqrt(sumSqrtAssetRuneDeviationMultiplied)) / standardDeviationsMultiplied;
      technicalAnalysisCache[poolId][periodKey].intervals = intervalsCalculations;
      technicalAnalysisCache[poolId][periodKey].assetStandardDeviation = assetStandardDeviation;
      technicalAnalysisCache[poolId][periodKey].runeStandardDeviation = runeStandardDeviation;
      technicalAnalysisCache[poolId][periodKey].correllation = correllation;
    });
  });
  return technicalAnalysisCache;
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
  const ta = technicalAnalysis(
    poolStats, poolHistoryDepths, poolHistorySwaps, allPoolsHistoryEarnings,
  );
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
  await set('technicalAnalysis', ta);
  
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

fetchDataJob('testnet');

// NOTE: no chaosnet on v2 testnet, so no fetch data for it for now
// fetchDataJob('chaosnet');
