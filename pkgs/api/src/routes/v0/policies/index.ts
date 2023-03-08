import type { FastifyPluginCallback } from 'fastify';

import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/policies' });

  done();
};

export default fn;
