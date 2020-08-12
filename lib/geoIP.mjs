import axios from 'axios';

process.on('unhandledRejection', up => { throw up });

function urlForIP(ip) {
  return `https://www.iplocate.io/api/lookup/${ip}`;
};

export async function lookupGeoIP(ip) {
  const url = urlForIP(ip);
  const { data } = await axios.get(url);
  return data;
};
