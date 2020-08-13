import redis from 'redis';
import { promisify } from 'util';

export async function withCache(cacheKey, func, { expire } = {}) {
  const client = redis.createClient();
  const getAsync = promisify(client.get).bind(client);
  const setAsync = promisify(client.set).bind(client);

  const cached = await getAsync(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const val = await func();

  await setAsync(cacheKey, JSON.stringify(val));
  if (expire) {
    client.expire(cacheKey, 86400);
  }
  client.unref();

  return val;
};
