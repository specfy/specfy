import type { FastifyPluginAsync } from 'fastify';

import { registerAuth } from '../middlewares/auth/index.js';

import activities from './v0/activities/index.js';
import auth from './v0/auth/index.js';
import components from './v0/components/index.js';
import documents from './v0/documents/index.js';
import flows from './v0/flows/index.js';
import github from './v0/github/index.js';
import invitations from './v0/invitations/index.js';
import keys from './v0/keys/index.js';
import me from './v0/me/index.js';
import orgs from './v0/orgs/index.js';
import perms from './v0/perms/index.js';
import policies from './v0/policies/index.js';
import projects from './v0/projects/index.js';
import revisions from './v0/revisions/index.js';
import root from './v0/root/index.js';
import users from './v0/users/index.js';

export const routes: FastifyPluginAsync = async (f) => {
  registerAuth(f);

  f.register(activities, { prefix: '/0' });
  f.register(auth, { prefix: '/0' });
  f.register(components, { prefix: '/0' });
  f.register(documents, { prefix: '/0' });
  f.register(keys, { prefix: '/0' });
  f.register(github, { prefix: '/0' });
  f.register(invitations, { prefix: '/0' });
  f.register(me, { prefix: '/0' });
  f.register(orgs, { prefix: '/0' });
  f.register(perms, { prefix: '/0' });
  f.register(policies, { prefix: '/0' });
  f.register(projects, { prefix: '/0' });
  f.register(revisions, { prefix: '/0' });
  f.register(flows, { prefix: '/0' });
  f.register(users, { prefix: '/0' });

  f.register(root, { prefix: '/0' });
  f.register(root);
};
