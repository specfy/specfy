import type { FastifyPluginCallback } from 'fastify';

import installations from './installations.js';
import linkOrg from './linkOrg.js';
import linkProject from './linkProject.js';
import members from './members.js';
import repos from './repos.js';
import webhooks from './webhooks.js';

const fn: FastifyPluginCallback = (f, _, done) => {
  f.register(repos, { prefix: '/github/repos' });
  f.register(installations, { prefix: '/github/installations' });
  f.register(members, { prefix: '/github/members' });
  f.register(webhooks, { prefix: '/github/webhooks' });
  f.register(linkOrg, { prefix: '/github/link_org' });
  f.register(linkProject, { prefix: '/github/link_project' });

  done();
};

export default fn;
