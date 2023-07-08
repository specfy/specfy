import type { FastifyPluginCallback } from 'fastify';

import github from './github.js';
import local from './local.js';
import logout from './logout.js';

const fn: FastifyPluginCallback = (f, _, done) => {
  f.register(github, { prefix: '/auth' });
  f.register(local, { prefix: '/auth' });
  f.register(logout, { prefix: '/auth' });

  done();
};

export default fn;
