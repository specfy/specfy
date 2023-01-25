import type { FastifyPluginCallback } from 'fastify';

import create from './create';
import get from './get';
import list from './list';
import remove from './remove';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/projects' });
  f.register(create, { prefix: '/projects' });
  f.register(get, { prefix: '/projects/:orgId/:slug' });
  f.register(remove, { prefix: '/projects/:orgId/:slug' });

  done();
};

export default fn;
