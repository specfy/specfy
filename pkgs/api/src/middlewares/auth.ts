import type { FastifyInstance } from 'fastify';

import type { Project, Revision } from '../models';
import { Perm, User } from '../models';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    perms?: Perm[];
    project?: Project;
    revision?: Revision;
  }
}

export function registerAuth(f: FastifyInstance) {
  f.decorateRequest('user', null);

  f.addHook('preHandler', async (req) => {
    const user = (await User.findOne({
      where: {
        // TODO: actual user
        email: 'bodin.samuel@gmail.com',
      },
    }))!;

    const perms = await Perm.scope('withOrg').findAll({
      where: {
        userId: user.id,
      },
    });

    req.user = user;
    req.perms = perms;
  });
}
