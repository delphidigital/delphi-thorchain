import {
  loadPools,
  loadPoolDetail,
  loadMarketData,
  loadConstants,
  loadNodeAccounts,
  loadNetwork,
  loadLastBlock,
  loadMimir,
  loadAsgardVaults,
} from './api.mjs';

// not sure where this should go
export default async function (ctx) {
  const poolIds = await loadPools({
    axios: ctx.$axios,
  });
  ctx.$store.commit('pools/setPoolIds', poolIds);

  await Promise.all(poolIds.map(async (poolId) => {
    const poolDetail = await loadPoolDetail({
      axios: ctx.$axios,
      poolId,
    });
    ctx.$store.commit('pools/setPoolDetail', { poolId, poolDetail: poolDetail[0] });
  }));

  const nodeAccounts = await loadNodeAccounts({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setNodeAccounts', nodeAccounts);

  const lastBlock = await loadLastBlock({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setLastBlock', lastBlock.thorchain);

  const mimir = await loadMimir({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setMinBond', mimir['mimir//MINIMUMBONDINRUNE']);

  const asgardVaults = await loadAsgardVaults({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setAsgardVaults', asgardVaults);

  const network = await loadNetwork({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setNextChurnHeight', network.nextChurnHeight);

  const marketData = await loadMarketData({
    axios: ctx.$axios,
  });
  ctx.$store.commit('runeMarketData/setData', marketData);

  const constants = await loadConstants({
    axios: ctx.$axios,
  });
  ctx.$store.commit('nodes/setOldValidatorRate', constants['int_64_values'].OldValidatorRate);
  ctx.$store.commit('nodes/setRotatePerBlockHeight', constants['int_64_values'].RotatePerBlockHeight);
}