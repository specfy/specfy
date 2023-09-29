import create from './create.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/sources' });
  await f.register(create, { prefix: '/sources' });
  await f.register(remove, { prefix: '/sources/:source_id' });
  await f.register(update, { prefix: '/sources/:source_id' });
};

export default fn;
