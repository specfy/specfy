import type { FastifyPluginAsync } from 'fastify';

import get from './get.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(get, { prefix: '/flows' });
};

export default fn;
