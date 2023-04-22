import type { FastifyPluginCallback } from 'fastify';

import count from './count';
import list from './list';
import remove from './remove';
import update from './update';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/perms' });
  f.register(remove, { prefix: '/perms' });
  f.register(update, { prefix: '/perms' });
  f.register(count, { prefix: '/perms' });

  done();
};

export default fn;
