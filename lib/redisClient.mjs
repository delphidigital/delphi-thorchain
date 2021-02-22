import redis from 'redis';
import { promisify } from 'util';
import url from 'url';

function RedisFactory() {
  let client = null;
  return {
    getInstance: () => {
      if (!client) {
        console.log(`REDISURL: ${process.env.REDIS_URL}`);
        if (process.env.REDIS_URL) {
          const redisURL = url.parse(process.env._REDIS_URL_);
          client = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true });
          client.auth(redisURL.auth.split(":")[1]);
        } else {
          client = redis.createClient();
        }
        client.getAsync = promisify(client.get).bind(client);
        client.setAsync = promisify(client.set).bind(client);
        client.lpushAsync = promisify(client.lpush).bind(client);
        client.lindexAsync = promisify(client.lindex).bind(client);
        client.lrangeAsync = promisify(client.lrange).bind(client);
        client.ltrimAsync = promisify(client.ltrim).bind(client);
        client.on('error', (err) => console.error(`REDIS ERROR: redisClient ${err.message}. ${JSON.stringify(err)}`));
      }
      return client;
    },
  };
}

export default RedisFactory().getInstance();

