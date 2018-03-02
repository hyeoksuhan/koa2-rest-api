const Koa = require('koa');
const Router = require('koa-router');
const compose = require('koa-compose');
const helmet = require('koa-helmet');
const jwt = require('koa-jwt');
const parse = require('co-body');
const session = require('koa-session');

const debug = require('debug')('koa2-rest-api-boilerplate');

function routing(routes, {prefix, jwtsecret}) {
  const rootRouter = Router({prefix});
  const subRouters = [];

  Object.keys(routes).forEach(prefix => {
    const router = new Router({prefix});
    subRouters.push(router);

    if (jwtsecret) {
      router.authCheck = () => jwt({ secret: jwtsecret });
    }

    const route = routes[prefix];
    route(router);
  });

  rootRouter.use.apply(rootRouter, subRouters.map(r => r.routes()));

  return compose([
    rootRouter.routes(),
    rootRouter.allowedMethods(),
  ]);
}

function bodyParser() {
  return async (ctx, next) => {
    ctx.request.body = await parse.json(ctx);
    await next();
  };
}

exports.createApp = ({
  prefix = '',
  cookieSignKeys = ['__cookie_sign_keys__'],
  jwtsecret,
  sessions,
  routes,
  log4js,
}) => {
  if (!routes) {
    throw new Error('You should set routes option');
  }

  debug('options:\n\tprefix: %s\n\tcookieSignKeys: %s\n\tjwtsecret: %s\n\tsessions: {store: %o, rolling: %s, maxAge: %d}\n\troutes: %o\n\tlog4js: %o',
    prefix, cookieSignKeys, jwtsecret, Object.getPrototypeOf(sessions.store), sessions.rolling, sessions.maxAge, routes, log4js);

  const app = new Koa();
  app.keys = cookieSignKeys;

  app.use(helmet());
  app.use(require('./response'));

  if (log4js) {
    app.use(require('./logger')(log4js));
  }

  app.use(require('./error_handler'));

  if (sessions) {
    app.use(session(app, sessions));
  }

  app.use(bodyParser());
  app.use(routing(routes, {prefix, jwtsecret}));

  return app;
};