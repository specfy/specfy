import type { FastifyPluginCallback } from 'fastify';

import create from './create';
import list from './list';
import remove from './remove';
import update from './update';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/orgs' });
  f.register(create, { prefix: '/orgs' });
  f.register(update, { prefix: '/orgs/:org_id' });
  f.register(remove, { prefix: '/orgs/:org_id' });

  done();
};

export default fn;
