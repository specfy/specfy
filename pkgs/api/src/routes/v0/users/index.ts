import get from './get.js';
import list from './list.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/users' });
  await f.register(get, { prefix: '/users/:user_id' });
};

export default fn;
