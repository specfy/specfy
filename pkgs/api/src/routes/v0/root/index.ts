import get from './get.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(get, { prefix: '/' });
};

export default fn;
