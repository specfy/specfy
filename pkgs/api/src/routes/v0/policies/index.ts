import type { FastifyPluginAsync } from 'fastify';

import list from './list.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/policies' });
};

export default fn;
