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
$ DATA_SOURCE=api node scripts/saveApiResponses.mjs
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
- TESTNET_NODE_IP: node ip to be used for testnet api queries, defaults to '168.119.21.60'.
- CHAOSNET_NODE_IP: node ip to be used for chaosnet api queries, defaults to ' '18.159.173.48'.
- SENDGRID_API_KEY: Sendgrid's API key used to send error notification emails.
- NOTIFICATION_MINUTE_TIME_INTERVAL: interval in minutes between notification emails (30 minutes by default). 

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


### Managing Heroku

Use heroku cli:
```
heroku git:remote -a v1dashboard-v2testnet
```

Or edit `~/.git/config` so that the remote heroku points to the correct instance:

```
[remote "heroku"]
	url = https://git.heroku.com/v1dashboard-v2testnet.git
	fetch = +refs/heads/*:refs/remotes/heroku/*
```

Then scale the worker and web:
```
heroku ps:scale web=1 worker=1
```

git push heroku rod/v2-dashboard:master

