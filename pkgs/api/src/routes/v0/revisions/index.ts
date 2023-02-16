import type { FastifyPluginCallback } from 'fastify';

import create from './create';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/revisions' });

  done();
};

export default fn;
