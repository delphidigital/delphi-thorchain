// import ThorchainApi from './api.mjs';
import thorchainUrls from './thorchainUrls.mjs';
import axios from 'axios';

async function getBlockchainOverview(blockchain) {
  const { cacheBase } = thorchainUrls(blockchain);
  const overviewUrl = `${cacheBase}/overview`;
  const response = await axios.get(overviewUrl);
  return response.data;
}

async function gePoolDetail(blockchain, pool) {
  const { cacheBase } = thorchainUrls(blockchain);
  const poolUrl = `${cacheBase}/pool/${pool}`;
  const response = await axios.get(poolUrl);
  return response.data;
}

export default async function (ctx, blockchain) {
  const {
    pools: poolList,
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
    // stats,
  } = await getBlockchainOverview(blockchain);
  // NOTE: Property status 'Enabled' is now 'Available' in v2
  const poolIds = poolList.filter(i => i.status === 'Available').map(i => i.asset);
  const enabledPools = await Promise.all(poolIds.map(async (poolId) => {
    const poolDetail = await gePoolDetail(blockchain, poolId)
    return { poolId, poolDetail };
  }));

  // Values with mimir overrides (NOTE(Fede): In theory Mimir won't be used in Mainnet)
  const rotatePerBlockHeight =
    mimir['mimir//ROTATEPERBLOCKHEIGHT'] || constants['int_64_values'].RotatePerBlockHeight
  const rotateRetryBlocks =
    mimir['mimir//ROTATERETRYBLOCKS'] || constants['int_64_values'].RotateRetryBlocks
  const desireValidatorSet =
    mimir['mimir//DESIREVALIDATORSET'] || constants['int_64_values'].DesireValidatorSet

  // NOTE: Only using BNB chain to get the last thorchain block and last binance block
  const lastBlock = lastBlocks.find(lb => lb.chain === 'BNB');

  // Store commits
  await Promise.all([
    ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts),
    ctx.$store.commit('pools/setPools', enabledPools),
    ctx.$store.commit('networkHealth/setLastThorchainBlock', lastBlock.thorchain),
    ctx.$store.commit('networkHealth/setLastBinanceBlock', lastBlock.last_observed_in), // old: lastBlock.lastobservedin
    ctx.$store.commit(
      'nodes/setGlobalParams',
      {
        minBond: mimir['mimir//MINIMUMBONDINRUNE'],
        minJoinVersion: version.next,
      }
    ),
    ctx.$store.commit('nodes/setAsgardVaults', asgardVaults),
    ctx.$store.commit('vaultBalances/setBinanceBalances', binanceAccounts),
    ctx.$store.commit('vaultBalances/setRunevaultBalance', runevaultBalance),
    ctx.$store.commit('networkHealth/setNetworkInfo', {
      totalReserve: network.totalReserve,
      totalPooledRune: network.totalPooledRune, // old was network.totalStaked
      poolShareFactor: network.poolShareFactor,
    }),
    ctx.$store.commit('runeMarketData/setData', marketData),
    ctx.$store.commit(
      'nodes/setChurnConstants',
      { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet }
    ),
  ]);
}
