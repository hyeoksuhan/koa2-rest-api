# koa2-rest-api
[![node][node-image]][node-url]
[![npm][npm-image]][npm-url]

[node-image]: https://img.shields.io/badge/node-%3E%3D%208.1.4-brightgreen.svg
[node-url]: https://nodejs.org

[npm-image]: https://img.shields.io/badge/npm-1.0.2-blue.svg
[npm-url]: https://www.npmjs.com/package/koa2-rest-api

rest api library for koa2

## Installation
```shell
$ npm install koa2-rest-api
```

## API
**app.createApp(options)**

- Returns: **new koa instance**
- options: *object*
  - jwtsecret: *string*
  - prefix: *string*
  - cookieSignKeys: *stringArray* (**Default**: ['\_\_cookie_sign_keys\_\_'])
  - log4js: *object*
  - session: *object*
    - store: *instance*
    - rolling: *boolean* (**Default**: false)
    - maxAge: *integer* (**Default**: 86400000)
  - reoutes: *object* (**required**)

- **jwtsecret**: This is the secret key for signing the jwt. If this is setted then authentication with jwt is enabled and authCheck function is added to router. The router is passed as parameter of routes function.
- **prefix**: The first path of REST api's uri. If base uri is `http://localhost:3000` and prefix is setted as '/api' then the base uri is changed to `http://localhost:3000/api`.
- **cookieSignKeys**: Set signed cookie keys. It should be array of keys. These keys may be rotated and are used when signing cookies.
- **log4js**: Set the logger. It is passed to inner [node log4js](https://www.npmjs.com/package/log4js). It should contain appenders and categories. See the log4js.configure function for more information.
- **session**: Set the koa-session's [options](https://github.com/koajs/session#example). Default store is cookie.
- **routes**: Set the routes function.

## Example
```js
const koaRest = require('koa2-rest-api');
const RedisStore = require('koa-session-redis-store');
const config = require('config');

const app = koaRest.createApp({
  jwtsecret: 'secret_key',
  prefix: '/api',
  cookieSignKeys: ['secret', 'keys'],
  sessions: {
    store: new RedisStore(),
    rolling: true,
    maxAge: 60*60*1000,
  },
  log4js: {
    appenders:{
      console: {
        type: 'console'
      }
    },
    categories: {
      koa: {
        appenders: ['console'],
        level: 'all'
      },
      default: {
        appenders: ['console'],
        level: 'info'
      }
    }
  },
  routes: (router) => {
    router.get('/hello', async ctx => {
      ctx.body = 'GET /hello';
    });
  }
});

// base api uri: http://localhost:3000/api because of prefix option
app.listen(process.env.PORT || 3000);
```

**ctx.sendResult(result)**  
Transform result to json type.

```js
const app = koaRest.createApp({
  ...
  routes: (router) => {
    router.get('/hello', async ctx => {
      // response: {result: 'hello'}
      ctx.sendResult('hello');
    });
  }
});
```

**ctx.sendError(error)**  
Transform error to json type with error_code and description.
```js
const app = koaRest.createApp({
  ...
  routes: (router) => {
    router.get('/error', async ctx => {
      const error = new Error('error_description');
      error.status = 400;
      error.code = 'code1';

      // status: 400, response: {error_code: 'code1', description: 'error_description'}
      ctx.sendError(error);
    });

    router.get('/error2', async ctx => {
      const error = new Error('error_description');
      error.code = 'code2';

      // status: 400, response: {error_code: 'code2', description: 'error_description'}
      ctx.sendError(400, error);
    });

    router.get('/error3', async ctx => {
      const error = new Error('error_description');

      // status: 500, response: {error_code: 'Error', description: 'error_description'}
      ctx.sendError(error);
    });
  }
});
```

**router.authCheck()**  
When bearer token is jwt that signed with jwtsecret then pass the middleware or response the route_not_logged_in error. 
The router.authCheck function is hidden when the jwtsecret is empty.

```js
const app = koaRest.createApp({
  ...
  routes: (router) => {
    router.get('/hello', router.authCheck(), async ctx => {
      // If bearer token is jwt and valid reached here
      // or response {error_code: 'router_not_logged_in', description: 'Login is required'} error
      ctx.body = 'GET /hello';
    });
  }
});
```

**ctx.request.body**
```js
const app = koaRest.createApp({
  ...
  routes: (router) => {
    // POST /hello, body: {message: 'hello'}
    router.post('/hello', async ctx => {
      // ctx.request.body.message: 'hello'
    });
  }
});
```

There's a boilerplate code [here](https://github.com/HanHyeoksu/koa2-rest-api-boilerplate).

## License
MIT