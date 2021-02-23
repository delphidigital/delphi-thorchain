# delphi-thorchain

## Install node version manager
Install instructions at https://github.com/nvm-sh/nvm, then:
```bash
$ nvm install && nvm use
```

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
- TESTNET_NODE_IP: node ip to be used for testnet api queries, defaults to '18.193.249.209' (from https://testnet.seed.thorchain.info/ or https://testnet.midgard.thorchain.info/v2/network).
- CHAOSNET_NODE_IP: node ip to be used for chaosnet api queries, defaults to ' '18.159.173.48'.
- SENDGRID_API_KEY: Sendgrid's API key used to send error notification emails.
- NOTIFICATION_MINUTE_TIME_INTERVAL: interval in minutes between notification emails (30 minutes by default). 

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).


### Heroku

Use heroku cli:
```
heroku git:remote -a thorchain-v2-dashboard
```

Validate or edit ~/.git/config to verify that the remote heroku points to the correct instance:
```
[remote "heroku"]
	url = https://git.heroku.com/thorchain-v2-dashboard.git
	fetch = +refs/heads/*:refs/remotes/heroku/*
```

Then scale the worker and web:
```
heroku ps:scale web=1 worker=1
```

Then push-deploy the branch to heroku app
```
git push heroku rod/v2-dashboard:master
```

For logs:
```
heroku logs --tail   
```