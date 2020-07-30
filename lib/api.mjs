// http://3.17.122.84:1317/thorchain/nodeaccounts
// http://52.221.153.64:8080/v1/pools
// http://3.17.122.84:8080/v1/pools/detail?asset=BNB.KFT-94F

import fns from 'date-fns';
const nodeBase = process.env.nodeBaseUrl;
const midgardBase = process.env.midgardBaseUrl;

export function poolsUrl() {
  return `${midgardBase}/v1/pools`;
};

export function poolDetailUrl({ asset }) {
  return `${midgardBase}/v1/pools/detail?asset=${asset}`;
};

export function nodesUrl() {
  return `${nodeBase}/thorchain/nodeaccounts`;
};

export function lastBlockUrl() {
  return `${nodeBase}/thorchain/lastblock`;
};

export function statsUrl() {
  return `${midgardBase}/v1/stats`;
};

export function constantsUrl() {
  return `${midgardBase}/v1/thorchain/constants`;
};

export function marketDataUrl() {
  return `/int/marketdata`;
}

export async function loadPools({ axios }) {
  const url = poolsUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadPoolDetail({ axios, poolId }) {
  const url = poolDetailUrl({ asset: poolId });
  const { data } = await axios.get(url);
  return data;
}

export async function loadNodeAccounts({ axios }) {
  const url = nodesUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadLastBlock({ axios }) {
  const url = lastBlockUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadStats({ axios }) {
  const url = statsUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadConstants({ axios }) {
  const url = constantsUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadMarketData({ axios }) {
  const url = marketDataUrl();
  const { data } = await axios.get(url);
  return data;
}
