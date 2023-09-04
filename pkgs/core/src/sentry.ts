import * as Sentry from '@sentry/node';

import { envs } from './env.js';

Sentry.init({
  dsn: envs.SENTRY_DSN || '',
});

export const sentry = Sentry;
