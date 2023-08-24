import type { FastifyPluginAsync } from 'fastify';

import operation from './operation.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(operation, { prefix: '/ai' });
};

export default fn;
