import redis from 'redis';
import { promisify } from 'util';

function RedisFactory() {
  let client = null;
  return {
    getInstance: () => {
      if (!client) {
        client = redis.createClient();
        client.getAsync = promisify(client.get).bind(client);
        client.setAsync = promisify(client.set).bind(client);
        client.lpushAsync = promisify(client.lpush).bind(client);
        client.lindexAsync = promisify(client.lindex).bind(client);
        client.lrangeAsync = promisify(client.lrange).bind(client);
        client.ltrimAsync = promisify(client.ltrim).bind(client);
        client.on('error', () => console.error('REDIS ERROR: redisClient'));
      }
      return client;
    },
  };
}

export default RedisFactory().getInstance();

