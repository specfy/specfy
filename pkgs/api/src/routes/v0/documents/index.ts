import type { FastifyPluginAsync } from 'fastify';

import get from './get.js';
import list from './list.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/documents' });
  await f.register(get, { prefix: '/documents/' });
};

export default fn;
