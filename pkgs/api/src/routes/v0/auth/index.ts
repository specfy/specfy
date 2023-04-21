import type { FastifyPluginCallback } from 'fastify';

import github from './github';
import local from './local';
import logout from './logout';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(github, { prefix: '/auth' });
  f.register(local, { prefix: '/auth' });
  f.register(logout, { prefix: '/auth' });

  done();
};

export default fn;
