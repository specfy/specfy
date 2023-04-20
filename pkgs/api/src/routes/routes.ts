import type { FastifyPluginAsync } from 'fastify';

import { registerAuth } from '../middlewares/auth';

import activities from './v0/activities';
import auth from './v0/auth';
import components from './v0/components';
import documents from './v0/documents';
import getMe from './v0/me/get';
import orgs from './v0/orgs';
import perms from './v0/perms';
import policies from './v0/policies';
import projects from './v0/projects';
import revisions from './v0/revisions';
import root from './v0/root';
import users from './v0/users';

export const routes: FastifyPluginAsync = async (f) => {
  registerAuth(f);

  f.register(activities, { prefix: '/0' });
  f.register(components, { prefix: '/0' });
  f.register(documents, { prefix: '/0' });
  f.register(getMe, { prefix: '/0' });
  f.register(auth, { prefix: '/0' });
  f.register(orgs, { prefix: '/0' });
  f.register(perms, { prefix: '/0' });
  f.register(policies, { prefix: '/0' });
  f.register(projects, { prefix: '/0' });
  f.register(revisions, { prefix: '/0' });
  f.register(users, { prefix: '/0' });
  f.register(root, { prefix: '/0' });
  f.register(root);
};
