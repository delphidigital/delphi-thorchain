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

  const poolIds = poolList.filter(i => i.status === 'Available').map(i => i.asset);
  const enabledPools = await Promise.all(poolIds.map(async (poolId) => {
    const poolDetail = await api.loadPoolDetail({
      axios: ctx.$axios,
      poolId,
    });
    return { poolId, poolDetail: poolDetail };
  }));

  // Values with mimir overrides (NOTE(Fede): In theory Mimir won't be used in Mainnet)
  const rotatePerBlockHeight =
    mimir['mimir//CHURNINTERVAL'] || constants['int_64_values'].ChurnInterval
  const rotateRetryBlocks =
    mimir['mimir//CHURNRETRYINTERVAL'] || constants['int_64_values'].ChurnRetryInterval
  const desireValidatorSet =
    mimir['mimir//DESIREDVALIDATORSET'] || constants['int_64_values'].DesiredValidatorSet
  const badValidatorRedline =
    mimir['mimir//BADVALIDATORREDLINE'] || constants['int_64_values'].BadValidatorRedline
  const minSlashPointsForBadValidator =
    mimir['mimir//MINSLASHPOINTSFORBADVALIDATOR'] || constants['int_64_values'].MinSlashPointsForBadValidator
  const badValidatorRate =
    mimir['mimir//BADVALIDATORRATE'] || constants['int_64_values'].BadValidatorRate

  const lastBlock = lastBlocks.find(lb => lb.chain === 'BNB');
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
    ctx.$store.commit('nodes/setBadValidatorRedline', badValidatorRedline),
    ctx.$store.commit('nodes/setMinSlashPointsForBadValidator', minSlashPointsForBadValidator),
    ctx.$store.commit('nodes/setBadValidatorRate', badValidatorRate),
    ctx.$store.commit('vaultBalances/setBinanceBalances', extra.binanceAccounts),
    ctx.$store.commit('vaultBalances/setRunevaultBalance', runevaultBalance),
    ctx.$store.commit('networkHealth/setNetworkInfo', {
      totalReserve: network.totalReserve,
      totalPooledRune: network.totalPooledRune,
      poolShareFactor: network.poolShareFactor,
    }),
    ctx.$store.commit('runeMarketData/setData', marketData),
    ctx.$store.commit(
      'nodes/setChurnConstants',
      { rotatePerBlockHeight, rotateRetryBlocks, desireValidatorSet }
    ),
  ]);
}
