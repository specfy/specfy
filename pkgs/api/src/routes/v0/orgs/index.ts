import type { FastifyPluginCallback } from 'fastify';

import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/orgs' });

  done();
};

export default fn;
