import get from './get.js';
import list from './list.js';
import summary from './summary/get.js';
import getUserActivities from './userActivities/get.js';

import type { FastifyPluginAsync } from 'fastify';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(list, { prefix: '/catalog' });
  await f.register(summary, { prefix: '/catalog/summary' });
  await f.register(get, { prefix: '/catalog/:tech_id' });
  await f.register(getUserActivities, {
    prefix: '/catalog/:tech_id/user_activities',
  });
};

export default fn;
