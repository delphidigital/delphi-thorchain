import { poolAddressesUrl } from './api.mjs';

const binanceBase = 'https://testnet-dex.binance.org';

export function binanceChainUrl(address) {
  return `${binanceBase}/api/v1/account/${address}`;
}

export async function loadBinanceChain({ axios }) {
  const pAddData = await axios.get(poolAddressesUrl());

  const url = binanceChainUrl(pAddData.data.current[0].address);
  const { data } = await axios.get(url);
  return data;
}
