const thorchainNodeIps = {
  testnet: process.env.TESTNET_NODE_IP || '168.119.21.60',
  chaosnet: process.env.CHAOSNET_NODE_IP || '18.159.173.48',
};

const thorchainPorts = {
  node: 1317,
  midgard: 8080, 
};

const dataSource = process.env.DATA_SOURCE || 'cache'

const thorchainBaseUrl = (blockchain, port) => {
  return `http://${thorchainNodeIps[blockchain]}:${thorchainPorts[port]}`
};

// TODO(Fede): might update to current url if that's something straightforward to do in Node.js
// of if we set that up in a config.
const cacheUrl = process.env.CACHE_URL || 'http://localhost:3021';
const cacheBaseUrl = (blockchain) => `${cacheUrl}/${blockchain}`;

const apiUrls = {
  chaosnet: {
    node: thorchainBaseUrl('chaosnet', 'node'),
    midgard: thorchainBaseUrl('chaosnet', 'midgard'),
  },
  testnet: {
    node: thorchainBaseUrl('testnet', 'node'),
    midgard: thorchainBaseUrl('testnet', 'midgard'),
  },
};

export default (blockchain) => ({
  nodeBase: dataSource === "api" ? 
    apiUrls[blockchain]['node'] : cacheBaseUrl(blockchain),
  midgardBase: dataSource === "api" ? 
    apiUrls[blockchain]['midgard'] : cacheBaseUrl(blockchain),
  cacheBase: cacheBaseUrl(blockchain),
})
