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
    technicalAnalysis,
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
  // Store commits
  await Promise.all([
    ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts),
    ctx.$store.commit('pools/setPools', availablePoolStats),
    ctx.$store.commit('pools/setTechnicalAnalysis', technicalAnalysis),
    ctx.$store.commit('pools/setPoolsHistoryDepths', availablePoolHistoryDepths),
    ctx.$store.commit('pools/setPoolsHistorySwaps', availablePoolHistorySwaps),
    ctx.$store.commit('networkHealth/setLastThorchainBlock', lastBlock?.thorchain),
    ctx.$store.commit('networkHealth/setLastBinanceBlock', lastBlock?.last_observed_in),
    ctx.$store.commit(
      'nodes/setGlobalParams',
      {
        minBond: mimir?.['mimir//MINIMUMBONDINRUNE'] || 0,
        minJoinVersion: version?.next || 0,
      }
    ),
    ctx.$store.commit('nodes/setAsgardVaults', asgardVaults),
    ctx.$store.commit('vaultBalances/setBinanceBalances', binanceAccounts),
    ctx.$store.commit('vaultBalances/setRunevaultBalance', runevaultBalance),
    ctx.$store.commit('networkHealth/setNetworkInfo', {
      totalReserve: network?.totalReserve || 0,
      totalPooledRune: network?.totalPooledRune || 0, // old was network.totalStaked
      poolShareFactor: network?.poolShareFactor || 0,
    }),
    ctx.$store.commit('runeMarketData/setData', marketData),
    ctx.$store.commit(
      'nodes/setChurnConstants',
      { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet }
    ),
  ]);
}
