import type { FastifyPluginCallback } from 'fastify';

import accept from './accept';
import create from './create';
import get from './get';
import list from './list';
import remove from './remove';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/invitations' });
  f.register(list, { prefix: '/invitations' });
  f.register(get, { prefix: '/invitations/:invitation_id' });
  f.register(remove, { prefix: '/invitations/:invitation_id' });
  f.register(accept, { prefix: '/invitations/:invitation_id' });

  done();
};

export default fn;
