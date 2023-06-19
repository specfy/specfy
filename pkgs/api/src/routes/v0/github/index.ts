import type { FastifyPluginCallback } from 'fastify';

import installations from './installations';
import linkOrg from './linkOrg';
import members from './members';
import repos from './repos';
import webhooks from './webhooks';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(repos, { prefix: '/github/repos' });
  f.register(installations, { prefix: '/github/installations' });
  f.register(members, { prefix: '/github/members' });
  f.register(webhooks, { prefix: '/github/webhooks' });
  f.register(linkOrg, { prefix: '/github/link_org' });

  done();
};

export default fn;
