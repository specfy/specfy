import path from 'node:path';

import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyServerOptions,
} from 'fastify';

import { dirname } from './common/env.js';
import { notFound, serverError } from './common/errors.js';
import { logger } from './logger.js';
import { AuthError } from './middlewares/auth/errors.js';
import { routes } from './routes/routes.js';

import './common/auth.js';
import { initSocket } from './socket.js';

export default async (f: FastifyInstance, opts: FastifyPluginOptions) => {
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
    } else {
      console.error(error);
      // fastify will use parent error handler to handle this
      return serverError(res);
    }
  });

  f.setNotFoundHandler(function (req, res) {
    return notFound(res, `${req.method} ${req.url}`);
  });

  await f.register(staticFiles, {
    root: path.join(dirname, '..', 'public'),
    prefix: '/',
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

  // Do not touch the following lines

  // await start();

  // Autoload breaks fastify
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // f.register(fastifyAutoload, {
  //   dir: path.join(__dirname, 'plugins'),
  //   options: Object.assign({}, opts),
  // });

  await routes(f, opts);

  initSocket(f.server);
};

export const options: FastifyServerOptions = {
  logger,
  // logger: true,
};
