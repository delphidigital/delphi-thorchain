import ThorchainApi from './api.mjs';

const binanceBase = {
  testnet: 'https://testnet-dex.binance.org',
  chaosnet: 'https://dex.binance.org',
}

export function binanceAccountUrl(blockchain, address) {
  return `${binanceBase[blockchain]}/api/v1/account/${address}`;
}

export async function binanceFetchAccounts({ axios }, blockchain, addresses) {
  const urls = addresses.map(a => binanceAccountUrl(blockchain, a));
  const binanceAccountsResponses = await Promise.all(urls.map(url => axios.get(url)))
  return binanceAccountsResponses.map(r => r.data);
}
