import type { FastifyPluginAsync } from 'fastify';

import get from './get.js';
import remove from './remove.js';
import update from './update.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(get, { prefix: '/me' });
  await f.register(update, { prefix: '/me' });
  await f.register(remove, { prefix: '/me' });
};

export default fn;
