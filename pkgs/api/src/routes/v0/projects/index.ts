import type { FastifyPluginCallback } from 'fastify';

import create from './create.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginCallback = (f, _, done) => {
  f.register(list, { prefix: '/projects' });
  f.register(create, { prefix: '/projects' });
  f.register(get, { prefix: '/projects/:org_id/:project_slug' });
  f.register(remove, { prefix: '/projects/:org_id/:project_slug' });
  f.register(update, { prefix: '/projects/:org_id/:project_slug' });

  done();
};

export default fn;
