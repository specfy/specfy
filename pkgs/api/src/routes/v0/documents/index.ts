import type { FastifyPluginCallback } from 'fastify';

import get from './get';
import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/documents' });
  f.register(get, { prefix: '/documents/' });

  done();
};

export default fn;
