import type { FastifyPluginCallback } from 'fastify';

import create from './create';
import get from './get';
import list from './list';
import remove from './remove';
import update from './update';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/projects' });
  f.register(create, { prefix: '/projects' });
  f.register(get, { prefix: '/projects/:org_id/:project_slug' });
  f.register(remove, { prefix: '/projects/:org_id/:project_slug' });
  f.register(update, { prefix: '/projects/:org_id/:project_slug' });

  done();
};

export default fn;
