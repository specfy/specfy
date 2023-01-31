import type { FastifyPluginCallback } from 'fastify';

import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/perms' });

  done();
};

export default fn;
