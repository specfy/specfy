import type { FastifyPluginCallback } from 'fastify';

import installations from './installations';
import repos from './repos';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(repos, { prefix: '/github/repos' });
  f.register(installations, { prefix: '/github/installations' });

  done();
};

export default fn;
