import type { FastifyPluginAsync } from 'fastify';

import count from './count.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/perms' });
  await f.register(remove, { prefix: '/perms' });
  await f.register(update, { prefix: '/perms' });
  await f.register(count, { prefix: '/perms' });
};

export default fn;
