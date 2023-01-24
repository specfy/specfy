import path from 'path';

import { fastifyAutoload } from '@fastify/autoload';
import cors from '@fastify/cors';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { routes } from './routes/routes';
import './db';

export default async (f: FastifyInstance, opts: FastifyPluginOptions) => {
  // Place here your custom code!
  await f.register(cors, {});
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  f.register(fastifyAutoload, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  await routes(f, opts);
};
