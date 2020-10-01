import ThorchainApi from './api.mjs';

import { loadBinanceChain } from './binanceApi.mjs';

// not sure where this should go
export default async function (ctx, blockchain) {
  const api = ThorchainApi(blockchain);

  // Fetch data
  const [
    poolList,
    nodeAccounts,
    lastBlock,
    mimir,
    asgardVaults,
    poolAddresses,
    binanceChain,
    network,
    marketData,
    constants,
    runevaultBalance,
    extra,
  ] = await Promise.all([
    api.loadPools({
      axios: ctx.$axios,
    }),
    api.loadNodeAccounts({
      axios: ctx.$axios,
    }),
    api.loadLastBlock({
      axios: ctx.$axios,
    }),
    api.loadMimir({
      axios: ctx.$axios,
    }),
    api.loadAsgardVaults({
      axios: ctx.$axios,
    }),
    api.loadPoolAddresses({
      axios: ctx.$axios,
    }),
    loadBinanceChain({
      axios: ctx.$axios,
    }, blockchain),
    api.loadNetwork({
      axios: ctx.$axios,
    }),
    api.loadMarketData({
      axios: ctx.$axios,
    }),
    api.loadConstants({
      axios: ctx.$axios,
    }),
    api.loadRunevaultBalance({
      axios: ctx.$axios,
    }),
    api.loadCacheExtra({
      axios: ctx.$axios,
    }),
  ])

  const poolIds = poolList.filter(i => i.status === 'Enabled').map(i => i.asset);
  const enabledPools = await Promise.all(poolIds.map(async (poolId) => {
    const poolDetail = await api.loadPoolDetail({
      axios: ctx.$axios,
      poolId,
    });
    return { poolId, poolDetail: poolDetail[0] };
  }));

  // Values with mimir overrides (NOTE(Fede): In theory Mimir won't be used in Mainnet)
  const rotatePerBlockHeight =
    mimir['mimir//ROTATEPERBLOCKHEIGHT'] || constants['int_64_values'].RotatePerBlockHeight
  const rotateRetryBlocks =
    mimir['mimir//ROTATERETRYBLOCKS'] || constants['int_64_values'].RotateRetryBlocks
  const desireValidatorSet =
    mimir['mimir//DESIREVALIDATORSET'] || constants['int_64_values'].DesireValidatorSet

  // Store commits
  await Promise.all([
    ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts),
    ctx.$store.commit('pools/setPools', enabledPools),
    ctx.$store.commit('networkHealth/setLastThorchainBlock', lastBlock.thorchain),
    ctx.$store.commit('networkHealth/setLastBinanceBlock', lastBlock.lastobservedin),
    ctx.$store.commit(
      'nodes/setGlobalParams',
      {
        minBond: mimir['mimir//MINIMUMBONDINRUNE'],
        minJoinVersion: extra.version.next,
      }
    ),
    ctx.$store.commit('nodes/setAsgardVaults', asgardVaults),
    ctx.$store.commit('vaultBalances/setPoolAddress', poolAddresses),
    ctx.$store.commit('vaultBalances/setBinanceBalances', binanceChain),
    ctx.$store.commit('vaultBalances/setRunevaultBalance', runevaultBalance),
    ctx.$store.commit('networkHealth/setNetworkInfo', {
      totalReserve: network.totalReserve,
      totalStaked: network.totalStaked,
      poolShareFactor: network.poolShareFactor,
    }),
    ctx.$store.commit('runeMarketData/setData', marketData),
    ctx.$store.commit(
      'nodes/setChurnConstants',
      { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet }
    ),
  ]);
}
