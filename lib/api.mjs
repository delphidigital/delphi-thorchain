// http://3.17.122.84:1317/thorchain/nodeaccounts
// http://52.221.153.64:8080/v1/pools
// http://3.17.122.84:8080/v1/pools/detail?asset=BNB.KFT-94F

import fns from 'date-fns';
import fs from 'fs';
const nodeBase = 'http://44.231.128.98:1317';
const midgardBase = 'http://44.231.128.98:8080';
const useStubs = process.env.useStubs;

export function poolsUrl() {
  return `${midgardBase}/v1/pools`;
};

export function poolDetailUrl({ asset }) {
  return `${midgardBase}/v1/pools/detail?asset=${asset}`;
};

export function nodesUrl() {
  return `${nodeBase}/thorchain/nodeaccounts`;
};

export function statsUrl() {
  return `${midgardBase}/v1/stats`;
};

function stubJSON(id) {
  const rawdata = fs.readFileSync(`./stubs/${id}.json`);
  return JSON.parse(rawdata);
}

export async function loadPools({ axios }) {
  if (useStubs) return stubJSON('pools');
  const url = poolsUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadPoolDetail({ axios, poolId }) {
  if (useStubs) return stubJSON(`pools-${poolId}`);
  const url = poolDetailUrl({ asset: poolId });
  const { data } = await axios.get(url);
  return data[0];
}

export async function loadNodeAccounts({ axios }) {
  if (useStubs) return stubJSON('nodeAccounts');
  const url = nodesUrl();
  const { data } = await axios.get(url);
  return data;
}

export async function loadStats({ axios }) {
  if (useStubs) return stubJSON('stats');
  const url = statsUrl();
  const { data } = await axios.get(url);
  return data;
}
