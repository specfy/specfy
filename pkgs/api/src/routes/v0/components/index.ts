import type { FastifyPluginCallback } from 'fastify';

import list from './list.js';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/components' });

  done();
};

export default fn;
