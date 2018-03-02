# koa2-rest-api
rest api library for koa2

## Installation
```shell
$ npm install koa2-rest-api
```
## Example
```javascript
const koaRest = require('koa2-rest-api');
const RedisStore = require('koa-session-redis-store');
const config = require('config');
const sessions = config.sessions;

const app = koaRest.createApp({
  jwtsecret: config.jwtsecret,
  prefix: '/api',
  cookieSignKeys: ['secret', 'keys'],
  sessions: {
    store: new RedisStore({
      host: sessions.redishost
    }),
    rolling: sessions.resave,
    maxAge: sessions.maxage,
  },
  log4js: config.log4js,
  routes: require('./routes')
});

app.listen(process.env.PORT || 3000);
```
There's a boilerplate code [here](https://github.com/HanHyeoksu/koa2-rest-api-boilerplate).
