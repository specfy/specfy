import path from 'node:path';

import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import staticFiles from '@fastify/static';
import {
  l as defaultLogger,
  dirname,
  envs,
  metrics,
  sentry,
} from '@specfy/core';
import { init } from '@specfy/es';
import { initSocket } from '@specfy/socket';
import rawBody from 'fastify-raw-body';

import { TransactionError, notFound, serverError } from './common/errors.js';
import { AuthError } from './middlewares/auth/errors.js';
import { registerAuth } from './middlewares/auth/index.js';
import { routes } from './routes/routes.js';
import './types/auth.js';

import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyServerOptions,
} from 'fastify';

function urlToTag(str: string) {
  return new URL(str, envs.API_HOSTNAME).pathname.replaceAll(':', '_');
}
const l = defaultLogger.child({ svc: 'api' });
export default async (f: FastifyInstance, opts: FastifyPluginOptions) => {
  f.addHook('onRequest', (req, _res, done) => {
    l.info(`#${req.id} <- ${req.method} ${req.url}`);
    metrics.increment('api.call', 1, [
      `path:${urlToTag(req.url).substring(0, 50)}}`,
      `method:${req.method.substring(0, 10)}`,
    ]);
    done();
  });
  f.addHook('onResponse', (_, res, done) => {
    l.info(`#${res.request.id} -> ${res.statusCode}`);
    done();
  });

  await f.register(cors, {
    // Important for cookies to work
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:5173',
      'https://app.specfy.io',
      'https://dev.specfy.io',
      'https://vercel.specfy.io',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  f.setErrorHandler(function (error, _req, res) {
    if (error instanceof AuthError) {
      return res.status(400).send(error.err);
    } else if (error instanceof TransactionError) {
      return res.status(400).send(error.err);
    } else {
      l.error(error instanceof Error ? error.message : error);
      sentry.captureException(error);
      // fastify will use parent error handler to handle this
      return serverError(res);
    }
  });

  f.setNotFoundHandler(function (req, res) {
    return notFound(res, `${req.method} ${req.url}`);
  });

  await f.register(staticFiles, {
    root: path.join(dirname, '..', 'api/src/public'),
    prefix: '/',
  });

  await f.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
  });

  f.removeAllContentTypeParsers();
  f.addContentTypeParser(
    'application/json',
    { parseAs: 'string', bodyLimit: 10971520 },
    function (_req, body, done) {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: unknown) {
        (err as any).statusCode = 400;
        done(err as any, undefined);
      }
    }
  );

  await registerAuth(f);

  // it's flawed because we are not using Redis (or PG), especially with the current Cloud Run setup
  // But should at least prevent some attack or abuse
  await f.register(rateLimit, {
    global: true,
    max: 2000,
    ban: 10,
    timeWindow: 60 * 5 * 1000,
    hook: 'preHandler',
    cache: 10000,
    allowList: [],
    continueExceeding: true,
    skipOnError: true,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    keyGenerator: (req) => {
      if (req.user) {
        return req.user.id;
      }

      return req.ip;
    },
  });

  await routes(f, opts);

  initSocket(f.server);

  await init();
};

export const options: FastifyServerOptions = {
  // logger: l.child({ svc: 'api' }),
  trustProxy: true,
  logger: false,
};
