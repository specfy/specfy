import { App } from 'octokit';

import { env } from '../../common/env.js';

const secret = env('GITHUB_WEBHOOKS_SECRET')!;
const app = new App({
  appId: env('GITHUB_CLIENT_APPID')!,
  privateKey: env('GITHUB_CLIENT_PKEY')!,
  webhooks: {
    secret,
  },
});

const ws = app.webhooks;
export const github = app;
export const webhookService = ws;
