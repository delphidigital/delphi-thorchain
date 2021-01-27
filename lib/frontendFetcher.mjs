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
  } = await getBlockchainOverview(blockchain);
  // Values with mimir overrides (NOTE(Fede): In theory Mimir won't be used in Mainnet)
  const rotatePerBlockHeight = mimir?.['mimir//ROTATEPERBLOCKHEIGHT']
    || constants?.['int_64_values']?.RotatePerBlockHeight
    || 0;
  const rotateRetryBlocks = mimir?.['mimir//ROTATERETRYBLOCKS']
    || constants?.['int_64_values']?.RotatePerBlockHeight
    || 0;
  const desireValidatorSet = mimir?.['mimir//DESIREVALIDATORSET']
    || constants?.['int_64_values']?.DesireValidatorSet
    || 0;

  // NOTE: Only using BNB chain to get the last thorchain block and last binance block
  const lastBlock = (lastBlocks || []).find(lb => lb.chain === 'BNB');

  // Store commits
  await Promise.all([
    ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts),
    ctx.$store.commit('pools/setPools', availablePoolStats),
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
