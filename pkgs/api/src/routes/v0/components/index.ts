import list from './list.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/components' });
};

export default fn;
