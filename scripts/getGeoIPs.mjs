
import client from '../lib/redisClient.mjs';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { withCache } from '../lib/cacheUtils.mjs';


async function run() {
  const result = await client.getAsync('nodeAccounts');
  const nodeAccounts = JSON.parse(result);
  const nodeAccountsWithLocation = await Promise.all(nodeAccounts.map(async (nodeAccount) => {
    const cacheKey = `nodeIP-${nodeAccount['ip_address']}`;
    const lookup = await withCache(cacheKey, async () => lookupGeoIP(nodeAccount['ip_address']));
    return { ...nodeAccount, location: lookup };
  }));
  await client.setAsync('nodeAccounts', JSON.stringify(nodeAccountsWithLocation));
  process.exit();
}

run();
