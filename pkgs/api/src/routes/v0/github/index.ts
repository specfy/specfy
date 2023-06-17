import type { FastifyPluginCallback } from 'fastify';

import installations from './installations';
import members from './members';
import repos from './repos';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(repos, { prefix: '/github/repos' });
  f.register(installations, { prefix: '/github/installations' });
  f.register(members, { prefix: '/github/members' });

  done();
};

export default fn;
