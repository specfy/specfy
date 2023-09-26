import accept from './accept.js';
import create from './create.js';
import decline from './decline.js';
import get from './get.js';
import list from './list.js';
import remove from './remove.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(create, { prefix: '/invitations' });
  await f.register(list, { prefix: '/invitations' });

  await f.register(accept, { prefix: '/invitations/:invitation_id/accept' });
  await f.register(decline, { prefix: '/invitations/:invitation_id/decline' });

  await f.register(get, { prefix: '/invitations/:invitation_id' });
  await f.register(remove, { prefix: '/invitations/:invitation_id' });
};

export default fn;
