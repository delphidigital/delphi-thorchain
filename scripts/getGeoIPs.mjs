import redis from 'redis';
import { lookupGeoIP } from '../lib/geoIP.mjs';
import { promisify } from 'util';

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

async function run() {
  const result = await getAsync('nodeAccounts');
  const json = JSON.parse(result);
  console.log(json);
  for (const i of json) {
    const ip = i['ip_address'];
    const lookup = await lookupGeoIP(ip);
    console.log({ ip, lookup });
  }

  process.exit();
}

run();