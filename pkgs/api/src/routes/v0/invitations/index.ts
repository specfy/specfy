import type { FastifyPluginCallback } from 'fastify';

import accept from './accept.js';
import create from './create.js';
import decline from './decline.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';

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
