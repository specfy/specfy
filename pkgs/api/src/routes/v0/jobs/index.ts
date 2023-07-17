import type { FastifyPluginAsync } from 'fastify';

import get from './get.js';
import list from './list.js';

const fn: FastifyPluginAsync = async (f) => {
  await await f.register(list, { prefix: '/jobs' });
  await await f.register(get, { prefix: '/jobs/:job_id' });
};

export default fn;
