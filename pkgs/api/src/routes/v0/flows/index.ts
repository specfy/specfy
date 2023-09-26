import get from './get.js';
import update from './update.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(get, { prefix: '/flows/:flow_id' });
  await f.register(update, { prefix: '/flows/:flow_id' });
};

export default fn;
