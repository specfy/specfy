import type { FastifyPluginCallback } from 'fastify';

import count from './count.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/perms' });
  f.register(remove, { prefix: '/perms' });
  f.register(update, { prefix: '/perms' });
  f.register(count, { prefix: '/perms' });

  done();
};

export default fn;
