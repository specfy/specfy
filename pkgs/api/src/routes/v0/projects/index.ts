import type { FastifyPluginCallback } from 'fastify';

import get from './get';
import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/projects' });
  f.register(get, { prefix: '/projects/:slug' });

  done();
};

export default fn;
