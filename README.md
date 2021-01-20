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
$ node scripts/saveApiResponses.mjs
```

### Run the app

```bash
# serve with hot reload at localhost:3021
$ yarn develop
```

### Environment variables
- PORT: port to run the app on.
- APP_URL: url to query cached data from, defaults to 'http://localhost:3021'.
- TESTNET_NODE_IP: node ip to be used for testnet api queries, defaults to '18.198.92.45'.
- CHAOSNET_NODE_IP: node ip to be used for chaosnet api queries, defaults to ' '18.159.173.48'.
- SENDGRID_API_KEY: Sendgrid's API key used to send error notification emails.
- NOTIFICATION_MINUTE_TIME_INTERVAL: interval in minutes between notification emails (30 minutes by default). 

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
