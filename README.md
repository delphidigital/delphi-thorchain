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
$ nodeBaseUrl=http://167.233.5.36:1317 midgardBaseUrl=http://167.233.5.36:8080 node scripts/saveApiResponses.mjs
```

### Run the app

```bash
# serve with hot reload at localhost:3021
$ yarn develop

# or manually
$ NODE_BASE_URL=http://localhost:3021 MIDGARD_BASE_URL=http://localhost:3021 PORT=3021 yarn dev
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
