import ddMetrics from 'datadog-metrics';

import { envs } from './env.js';

ddMetrics.init({
  apiKey: envs.DD_API_KEY,
  prefix: 'specfy.',
  defaultTags: [`env:${process.env.NODE_ENV}`],
  reporter:
    envs.DD_API_KEY !== ''
      ? new ddMetrics.reporters.DatadogReporter()
      : new ddMetrics.reporters.NullReporter(),
});

export const metrics = ddMetrics;
