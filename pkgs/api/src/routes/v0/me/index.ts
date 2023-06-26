import type { FastifyPluginCallback } from 'fastify';

import get from './get.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(get, { prefix: '/me' });
  f.register(update, { prefix: '/me' });
  f.register(remove, { prefix: '/me' });

  done();
};

export default fn;
