// import path from 'path';

// import { fastifyAutoload } from '@fastify/autoload';
import cors from '@fastify/cors';
import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyServerOptions,
} from 'fastify';

import { start } from './db';
import { logger } from './logger';
import { routes } from './routes/routes';
import './common/auth';

export default async (f: FastifyInstance, opts: FastifyPluginOptions) => {
  // Place here your custom code!
  await f.register(cors, {});
  // Do not touch the following lines

  await start();

  // Autoload breaks fastify
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // f.register(fastifyAutoload, {
  //   dir: path.join(__dirname, 'plugins'),
  //   options: Object.assign({}, opts),
  // });

  await routes(f, opts);
};

export const options: FastifyServerOptions = {
  logger,
};
