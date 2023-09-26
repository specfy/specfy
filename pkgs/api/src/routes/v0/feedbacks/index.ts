import create from './create.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(create, { prefix: '/feedbacks' });
};

export default fn;
