import operation from './operation.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(operation, { prefix: '/ai' });
};

export default fn;
