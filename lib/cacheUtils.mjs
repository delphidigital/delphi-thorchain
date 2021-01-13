
import client from '../lib/redisClient.mjs';

export async function withCache(cacheKey, func, { expire } = {}) {

  const cached = await client.getAsync(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const val = await func();

  await client.setAsync(cacheKey, JSON.stringify(val));
  if (expire) {
    client.expire(cacheKey, 86400);
  }
  client.unref();

  return val;
};
