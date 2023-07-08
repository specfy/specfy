import type { FastifyPluginCallback } from 'fastify';

import create from './create.js';
import list from './list.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginCallback = (f, _, done) => {
  f.register(list, { prefix: '/orgs' });
  f.register(create, { prefix: '/orgs' });
  f.register(update, { prefix: '/orgs/:org_id' });
  f.register(remove, { prefix: '/orgs/:org_id' });

  done();
};

export default fn;
