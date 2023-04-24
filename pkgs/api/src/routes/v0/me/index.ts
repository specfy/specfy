import type { FastifyPluginCallback } from 'fastify';

import get from './get';
import remove from './remove';
import update from './update';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(get, { prefix: '/me' });
  f.register(update, { prefix: '/me' });
  f.register(remove, { prefix: '/me' });

  done();
};

export default fn;
