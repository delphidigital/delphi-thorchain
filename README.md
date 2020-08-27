# delphi-thorchain

## Build Setup

```bash
# install dependencies
$ yarn install
```

### Start Redis

```bash
# For instance
brew services start redis
```

### Fetch cached data

```bash
$ yarn fetch

# or do it manually
$ nodeBaseUrl=DATA_SOURCE=api node scripts/saveApiResponses.mjs
```

### Run the app

```bash
# serve with hot reload at localhost:3021
$ yarn develop

# or manually
$ DATA_SOURCE=cache PORT=3021 yarn dev
```

### Environment variables
- PORT: port to run the app on.
- DATA_SOURCE: where to get data from (either "api" to request real sources or "cache" to use data stored in Redis).
- CACHE_URL: url to query cached data from, defaults to 'http://localhost:3021'.
- TESTNET_NODE_IP: node ip to be used for testnet api queries, defaults to '161.233.5.36'.
- CHAOSNET_NODE_IP: node ip to be used for chaosnet api queries, defaults to ' '18.159.173.48'.

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
