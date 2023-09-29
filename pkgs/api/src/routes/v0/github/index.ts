import installations from './installations.js';
import linkOrg from './linkOrg.js';
import members from './members.js';
import repos from './repos.js';
import webhooks from './webhooks.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(repos, { prefix: '/github/repos' });
  await f.register(installations, { prefix: '/github/installations' });
  await f.register(members, { prefix: '/github/members' });
  await f.register(webhooks, { prefix: '/github/webhooks' });
  await f.register(linkOrg, { prefix: '/github/link_org' });
};

export default fn;
