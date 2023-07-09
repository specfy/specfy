import type { FastifyPluginAsync } from 'fastify';

import get from './get.js';
import update from './update.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(get, { prefix: '/flows/:flow_id' });
  await f.register(update, { prefix: '/flows/:flow_id' });
};

export default fn;
