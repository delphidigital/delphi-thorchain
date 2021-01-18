import ThorchainApi from './api.mjs';

// not sure where this should go
export default async function (ctx, blockchain) {
  const api = ThorchainApi(blockchain);

  // Fetch data
  const [
    poolList,
    nodeAccounts,
    lastBlocks,
    mimir,
    asgardVaults,
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

  // NOTE: Property status 'Enabled' is now 'Available' in v2
  const poolIds = poolList.filter(i => i.status === 'Available').map(i => i.asset);
  const enabledPools = await Promise.all(poolIds.map(async (poolId) => {
    const poolDetail = await api.loadPoolDetail({
      axios: ctx.$axios,
      poolId,
    });
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
        minJoinVersion: extra.version.next,
      }
    ),
    ctx.$store.commit('nodes/setAsgardVaults', asgardVaults),
    ctx.$store.commit('vaultBalances/setBinanceBalances', extra.binanceAccounts),
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
