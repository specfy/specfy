import type { FastifyPluginCallback } from 'fastify';

import accept from './accept';
import create from './create';
import decline from './decline';
import get from './get';
import list from './list';
import remove from './remove';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/invitations' });
  f.register(list, { prefix: '/invitations' });

  f.register(accept, { prefix: '/invitations/:invitation_id/accept' });
  f.register(decline, { prefix: '/invitations/:invitation_id/decline' });

  f.register(get, { prefix: '/invitations/:invitation_id' });
  f.register(remove, { prefix: '/invitations/:invitation_id' });

  done();
};

export default fn;
