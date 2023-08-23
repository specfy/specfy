import type { FastifyPluginAsync } from 'fastify';

import activities from './v0/activities/index.js';
import auth from './v0/auth/index.js';
import components from './v0/components/index.js';
import demo from './v0/demo/index.js';
import documents from './v0/documents/index.js';
import feedbacks from './v0/feedbacks/index.js';
import flows from './v0/flows/index.js';
import github from './v0/github/index.js';
import invitations from './v0/invitations/index.js';
import jobs from './v0/jobs/index.js';
import keys from './v0/keys/index.js';
import me from './v0/me/index.js';
import orgs from './v0/orgs/index.js';
import perms from './v0/perms/index.js';
import policies from './v0/policies/index.js';
import projects from './v0/projects/index.js';
import revisions from './v0/revisions/index.js';
import root from './v0/root/index.js';
import stripe from './v0/stripe/index.js';
import users from './v0/users/index.js';

export const routes: FastifyPluginAsync = async (f) => {
  await f.register(activities, { prefix: '/0' });
  await f.register(auth, { prefix: '/0' });
  await f.register(components, { prefix: '/0' });
  await f.register(demo, { prefix: '/0' });
  await f.register(documents, { prefix: '/0' });
  await f.register(feedbacks, { prefix: '/0' });
  await f.register(flows, { prefix: '/0' });
  await f.register(github, { prefix: '/0' });
  await f.register(invitations, { prefix: '/0' });
  await f.register(jobs, { prefix: '/0' });
  await f.register(keys, { prefix: '/0' });
  await f.register(me, { prefix: '/0' });
  await f.register(orgs, { prefix: '/0' });
  await f.register(perms, { prefix: '/0' });
  await f.register(policies, { prefix: '/0' });
  await f.register(projects, { prefix: '/0' });
  await f.register(revisions, { prefix: '/0' });
  await f.register(stripe, { prefix: '/0' });
  await f.register(users, { prefix: '/0' });

  await f.register(root, { prefix: '/0' });
  await f.register(root);
};
