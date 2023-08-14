import type { FastifyPluginAsync } from 'fastify';

import cancel from './cancelSubscription.js';
import createSubscription from './createSubscription.js';
import getSubscription from './getSubscription.js';
import usage from './usage.js';
import webhooks from './webhooks.js';

const fn: FastifyPluginAsync = async (f) => {
  await f.register(getSubscription, {
    prefix: '/stripe/:org_id/subscription',
  });
  await f.register(createSubscription, {
    prefix: '/stripe/:org_id/subscription',
  });
  await f.register(cancel, { prefix: '/stripe/:org_id/subscription' });
  await f.register(usage, { prefix: '/stripe/:org_id/usage' });

  await f.register(webhooks, { prefix: '/stripe/webhooks' });
};

export default fn;
