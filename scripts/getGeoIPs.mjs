import geoip from 'geoip-lite';
import redis from 'redis';

const client = redis.createClient();

client.get('nodeAccounts', function(error, result) {
  if(error) {
    console.log(error);
  } else {
    const json = JSON.parse(result);
    const out = 
      json
        .map(n => n["ip_address"])
        .map(ip => {
          const lkp = geoip.lookup(ip);
          lkp.ip = ip;
          return lkp;
        });

    console.log(out);
  }
});

const ip = '18.158.69.134';
console.log(geoip.lookup(ip));
