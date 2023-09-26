import create from './create.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/orgs' });
  await f.register(create, { prefix: '/orgs' });
  await f.register(update, { prefix: '/orgs/:org_id' });
  await f.register(remove, { prefix: '/orgs/:org_id' });
};

export default fn;
