import type { FastifyPluginCallback } from 'fastify';

import create from './create';
import list from './list';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(list, { prefix: '/orgs' });
  f.register(create, { prefix: '/orgs' });

  done();
};

export default fn;
