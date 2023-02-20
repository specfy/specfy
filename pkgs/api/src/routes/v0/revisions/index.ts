import type { FastifyPluginCallback } from 'fastify';

import create from './create';
import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/revisions' });
  f.register(list, { prefix: '/revisions' });

  done();
};

export default fn;
