import type { FastifyPluginAsync } from 'fastify';

import bySlug from './bySlug.js';
import create from './create.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/projects' });
  await f.register(create, { prefix: '/projects' });
  await f.register(get, { prefix: '/projects/:project_id' });
  await f.register(bySlug, { prefix: '/projects/by_slug' });
  await f.register(remove, { prefix: '/projects/:project_id' });
  await f.register(update, { prefix: '/projects/:project_id' });
};

export default fn;
