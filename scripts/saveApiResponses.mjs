import axios from 'axios';
import { thorchainDataFetcher } from '../lib/thorchainUrls.mjs';
import { binanceFetchAccounts } from '../lib/binanceApi.mjs';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';
import redisClient from '../lib/redisClient.mjs';
import EmailProvider from '../lib/emailProvider.mjs';
import { technicalAnalysis } from '../lib/ta.mjs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const BITQUERY_API_KEY = 'BQYZBiPHTr0Y16cJjP0D3uRgpzYIaNPr';

// Query each blockchain from inbound addresses
// https://midgard.thorchain.info/v2/thorchain/inbound_addresses
async function getBalancesFromChainAddr(chain, addr, net, routerAddr) {
  console.log(`[${net}] [${chain}] Getting chain balances.`);
  if (chain === 'BTC') {
    const minConfirmationos = 50;
    const btcnet = net === 'mainnet' ? 'BTC' : 'BTCTEST';
    const url = `https://chain.so/api/v2/get_address_balance/${btcnet}/${addr}/${minConfirmationos}`;
    const { data } = await axios.get(url);
    return [{ network: chain, address: addr, balance: parseFloat(data.data.confirmed_balance) }];
  } else if (chain === 'LTC') {
    const minConfirmationos = 50;
    const ltcnet = net === 'mainnet' ? 'LTC' : 'LTCTEST';
    const url = `https://chain.so/api/v2/get_address_balance/${ltcnet}/${addr}/${minConfirmationos}`;
    const { data } = await axios.get(url);
    return [{ network: chain, address: addr, balance: parseFloat(data.data.confirmed_balance) }];
  } else if (chain === 'BCH') {
    // NOTE: BCH only works for mainnet, couldn't find a BCH testnet explorer
    const query = `{
      bitcoin(network: bitcash){
        inputs(inputAddress: {is: "qzvhxqm3clrhewqllfmt2ekuaa7puhwpns3kl5nj7a" }){ value }
        outputs(outputAddress: {is: "qzvhxqm3clrhewqllfmt2ekuaa7puhwpns3kl5nj7a" }){ value }
      }
    }`;
    const url = "https://graphql.bitquery.io/";
    const data = await axios.post(url, { query }, {
      headers: { "Content-Type": "application/json", "X-API-KEY": BITQUERY_API_KEY },
    });
    const balance = (data.data.data.bitcoin.outputs?.[0].value || 0) - (data.data.data.bitcoin.inputs?.[0].value);
    return [{ network: chain, address: addr, balance }];
  } else if (chain === 'BNB') {
    // https://docs.binance.org/api-reference/dex-api/paths.html
    // net can be testnet or mainnet
    const url = net === 'mainnet'
      ? `https://dex.binance.org/api/v1/account/${addr}`
      : `https://testnet-dex.binance.org/api/v1/account/${addr}`;
    const { data } = await axios.get(url);
    return data.balances.map(b => ({
      network: chain, address: addr, symbol: b.symbol, balance: parseFloat(b.free)
    }));
  } else if (chain === 'ETH') {
    // NOTE: on eth there is the eth address, and the router address provided,
    //       the token balances is at the router address
    const query = `{ ethereum { address(address: {in: ["${addr}", "${routerAddr}"]}) { balances { currency { symbol } value } } } }`;
    const url = "https://graphql.bitquery.io/";
    const { data } = await axios.post(url, { query }, {
      headers: { "Content-Type": "application/json", "X-API-KEY": BITQUERY_API_KEY },
    });
    return [
      ...data.data.ethereum.address[0].balances.map(b => ({
        network: chain, address: addr, balance: b.value, symbol: b.currency.symbol
      })),
      ...data.data.ethereum.address[1].balances.map(b => ({
        network: chain, address: addr, balance: b.value, symbol: b.currency.symbol
      }))
    ]
  }
}

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
  const api = await thorchainDataFetcher(blockchain);

  // FETCH DATA
  // Thorchain
  const queue = await api.loadQueue();
  const poolList = await api.loadPools();
  const v1SinglechainStats = await api.loadV1SinglechainStats();
  const v1SinglechainNetwork = await api.loadV1SinglechainNetwork();
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


  // TODO HERE ADD BITQUERY
  // NOTE USING https://sochain.com/api TO QUERY

  let chainBalances = [];
  for (const ia of inboundAddresses) {
    const net = blockchain === 'chaosnet' ? 'mainnet' : 'testnet';
    const balances = await getBalancesFromChainAddr(ia.chain, ia.address, net, ia.router);
    chainBalances = chainBalances.concat(balances);
  }

  // Other sources
  let runevaultBalance = 0;
  // NOTE: runevaultBalance url is failing
  // if (blockchain === 'chaosnet') {
  //   const frozenBalancesReq = await axios.get('http://frozenbalances.herokuapp.com/stats/RUNE-B1A');
  //   runevaultBalance = frozenBalancesReq.data.totalFrozen;
  // }
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


  const periods = ['period24H', 'period1W', 'period1M', 'period3M', 'period6M', 'period1Y'];
  const taPeriods = {};
  periods.forEach(periodKey => {
    taPeriods[periodKey] = technicalAnalysis(
      poolHistoryDepths, poolHistorySwaps, allPoolsHistoryEarnings, periodKey
    );
  });

  // SET DATA
  await set('chainBalances', chainBalances);
  await set('queue', queue);
  await set('pools', poolList);
  Object.keys(poolStats).forEach(async (poolId) => {
    await set(`pools-${poolId}`, poolStats[poolId]);
  });
  await set('v1SinglechainStats', v1SinglechainStats);
  await set('v1SinglechainNetwork', v1SinglechainNetwork);
  await set('allPoolsHistoryEarnings', allPoolsHistoryEarnings);
  await set('poolHistoryDepths', poolHistoryDepths);
  await set('poolHistorySwaps', poolHistorySwaps);
  await set('nodeAccounts', nodeAccountsWithLocation);
  await set('lastBlock', lastBlock);
  await set('mimir', mimir);
  await set('asgardVaults', asgardVaults);
  await set('taPeriods', taPeriods);
  
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
  await sleep(10000);
}

let consecutiveErrorAttempts = 0;
let notificationSent = false;
const NOTIFICATION_MINUTE_TIME_INTERVAL = process.env.NOTIFICATION_MINUTE_TIME_INTERVAL || 30;

async function fetchDataJob(blockchain) {
  try {
    await updateBlockchainData(blockchain);
    if (consecutiveErrorAttempts > 0) { consecutiveErrorAttempts = 0; }
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
  }
}

async function main() {
  await fetchDataJob('chaosnet');
  await fetchDataJob('testnet');
  // await sleep(60*1000*5); // sleep 5 mins
  await main()
}
main();