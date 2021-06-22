import axios from 'axios';

const cacheUrl = process.env.APP_URL || 'http://localhost:3021';
const nodejsAppUrl = (blockchain) => `${cacheUrl}/${blockchain}`;

async function getBlockchainOverview(blockchain) {
  const baseUrl = nodejsAppUrl(blockchain);
  const overviewUrl = `${baseUrl}/overview`;
  const response = await axios.get(overviewUrl);
  return response.data;
}

export default async function (ctx, blockchain) {
  const {
    nodes: nodeAccounts,
    lastBlock: lastBlocks,
    mimir,
    asgardVaults,
    network,
    market: marketData,
    constants,
    runevaultBalance,
    version,
    binanceAccounts,
    availablePoolStats,
    availablePoolHistoryDepths,
    availablePoolHistorySwaps,
    taPeriods,
    allPoolsHistoryEarnings,
    pools,
    stats,
    queue,
    v1SinglechainStats,
    v1SinglechainNetwork,
    chainBalances,
  } = await getBlockchainOverview(blockchain);
  // Values with mimir overrides (NOTE(Fede): In theory Mimir won't be used in Mainnet)
  const rotatePerBlockHeight = (
    mimir['mimir//CHURNINTERVAL'] || constants['int_64_values'].ChurnInterval
  )
  const rotateRetryBlocks = (
    mimir['mimir//CHURNRETRYINTERVAL'] || constants['int_64_values'].ChurnRetryInterval
  );
  const desireValidatorSet = (
    mimir['mimir//DESIREDVALIDATORSET'] || constants['int_64_values'].DesiredValidatorSet
  );
  // const badValidatorRedline = (
  //   mimir['mimir//BADVALIDATORREDLINE'] || constants['int_64_values'].BadValidatorRedline
  // );
  // const minSlashPointsForBadValidator = (
  //   mimir['mimir//MINSLASHPOINTSFORBADVALIDATOR'] || constants['int_64_values'].MinSlashPointsForBadValidator
  // );
  // const badValidatorRate = (
  //   mimir['mimir//BADVALIDATORRATE'] || constants['int_64_values'].BadValidatorRate
  // );

  // NOTE: Only using BNB chain to get the last thorchain block and last binance block
  const lastBlock = (lastBlocks || []).find(lb => lb.chain === 'BNB');

  let taPeriodsVal = taPeriods;
  let availablePoolHistoryDepthsVal = availablePoolHistoryDepths;
  let availablePoolHistorySwapsVal = availablePoolHistorySwaps;
  // HACK NOTE:
  // the cache uses too much memory, as it preloads all the 
  // pools indicators for different time frames
  // to avoid passing this large object through Nuxt SSR
  // don't store that data at the server's cache and first page load
  if (typeof window === 'undefined') {
    // Don't SSR with pools TA
    taPeriodsVal =  { period24H: {}, period1W: taPeriods.period1W, period1M: {}, period3M: {}, period6M: {}, period1Y: {} };
    // availablePoolHistoryDepthsVal = {};
    // availablePoolHistorySwapsVal = {};
  }
  // Store commits
  await Promise.all([
    ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts),
    ctx.$store.commit('pools/setPoolsOverview', pools),
    ctx.$store.commit('pools/setPools', availablePoolStats),
    ctx.$store.commit('pools/setTaPeriods', taPeriodsVal),
    ctx.$store.commit('pools/setPoolsHistoryDepths', availablePoolHistoryDepthsVal),
    ctx.$store.commit('pools/setPoolsHistorySwaps', availablePoolHistorySwapsVal),
    ctx.$store.commit('pools/setAllPoolsHistoryEarnings', allPoolsHistoryEarnings),
    ctx.$store.commit('networkHealth/setLastThorchainBlock', lastBlock?.thorchain),
    ctx.$store.commit('networkHealth/setLastBinanceBlock', lastBlock?.last_observed_in),
    ctx.$store.commit('networkHealth/setStats', stats),
    ctx.$store.commit('networkHealth/setSinglechainStats', v1SinglechainStats),
    ctx.$store.commit('networkHealth/setQueue', queue),
    ctx.$store.commit(
      'nodes/setGlobalParams',
      {
        minBond: mimir?.['mimir//MINIMUMBONDINRUNE'] || 0,
        minJoinVersion: version?.next || 0,
      }
    ),
    ctx.$store.commit('nodes/setAsgardVaults', asgardVaults),
    ctx.$store.commit('vaultBalances/setChainBalances', chainBalances),
    ctx.$store.commit('vaultBalances/setBinanceBalances', binanceAccounts),
    ctx.$store.commit('vaultBalances/setRunevaultBalance', runevaultBalance),
    ctx.$store.commit('networkHealth/setNetworkInfo', {
      totalReserve: network?.totalReserve || 0,
      totalPooledRune: network?.totalPooledRune || 0, // old was network.totalStaked
      poolShareFactor: network?.poolShareFactor || 0,
      network,
    }),
    ctx.$store.commit('networkHealth/setSinglechainNetworkInfo', v1SinglechainNetwork),
    ctx.$store.commit('runeMarketData/setData', marketData),
    ctx.$store.commit(
      'nodes/setChurnConstants',
      { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet, constants }
    ),
  ]);
}
