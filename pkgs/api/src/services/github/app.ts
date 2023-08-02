import { App } from 'octokit';

import { envs } from '../../common/env.js';

const secret = envs.GITHUB_WEBHOOKS_SECRET;
const app = new App({
  appId: envs.GITHUB_CLIENT_APPID,
  privateKey: envs.GITHUB_CLIENT_PKEY,
  webhooks: {
    secret,
  },
});

const ws = app.webhooks;
export const github = app;
export const webhookService = ws;
