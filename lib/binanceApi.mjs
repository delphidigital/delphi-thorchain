import ThorchainApi from './api.mjs';

const binanceBase = {
  testnet: 'https://testnet-dex.binance.org',
  chaosnet: 'https://dex.binance.org',
}

export function binanceChainUrl(blockchain, address) {
  return `${binanceBase[blockchain]}/api/v1/account/${address}`;
}

export async function loadBinanceChain({ axios }, blockchain) {
  const api = ThorchainApi(blockchain);
  const pAddData = await axios.get(api.poolAddressesUrl());

  const url = binanceChainUrl(blockchain, pAddData.data.current[0].address);
  const { data } = await axios.get(url);
  return data;
}
