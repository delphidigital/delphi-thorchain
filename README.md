# delphi-thorchain

## Build Setup

```bash
# install dependencies
$ yarn install

# fetch cached data
$ nodeBaseUrl=http://54.159.160.41:1317 midgardBaseUrl=http://54.159.160.41:8080 node scripts/saveApiResponses.mjs

# serve with hot reload at localhost:3021
$ NODE_BASE_URL="http://localhost:3021" MIDGARD_BASE_URL="http://localhost:3021" PORT=3021 yarn dev
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
