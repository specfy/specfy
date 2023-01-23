import type { FastifyPluginAsync } from 'fastify';

import getMe from './v0/me/get';

export const routes: FastifyPluginAsync = async (f) => {
  f.register(getMe, { prefix: '/0' });

  f.get('/', async function () {
    return { root: true };
  });
};
