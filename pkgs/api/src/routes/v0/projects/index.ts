import type { FastifyPluginAsync } from 'fastify';

import create from './create.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/projects' });
  await f.register(create, { prefix: '/projects' });
  await f.register(get, { prefix: '/projects/:org_id/:project_slug' });
  await f.register(remove, { prefix: '/projects/:org_id/:project_slug' });
  await f.register(update, { prefix: '/projects/:org_id/:project_slug' });
};

export default fn;
