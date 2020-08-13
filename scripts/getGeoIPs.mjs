import redis from 'redis';
import { promisify } from 'util';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

async function run() {
  const result = await getAsync('nodeAccounts');
  const nodeAccounts = JSON.parse(result);
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => {
      return await lookupGeoIP(nodeAccount['ip_address']);
    });
    return { ...nodeAccount, location: lookup };
  }));
  await setAsync('nodeAccounts', JSON.stringify(nodeAccountsWithLocation));
  process.exit();
}

run();