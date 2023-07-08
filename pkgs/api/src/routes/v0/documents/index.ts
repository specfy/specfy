import type { FastifyPluginCallback } from 'fastify';

import get from './get.js';
import list from './list.js';

const fn: FastifyPluginCallback = (f, _, done) => {
  f.register(list, { prefix: '/documents' });
  f.register(get, { prefix: '/documents/' });

  done();
};

export default fn;
