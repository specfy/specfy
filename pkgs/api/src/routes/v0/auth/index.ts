import type { FastifyPluginAsync } from 'fastify';

import github from './github.js';
import local from './local.js';
import logout from './logout.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(github, { prefix: '/auth' });
  await f.register(local, { prefix: '/auth' });
  await f.register(logout, { prefix: '/auth' });
};

export default fn;
