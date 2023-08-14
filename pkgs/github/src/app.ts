import type { Webhooks } from '@octokit/webhooks';
import { envs } from '@specfy/core';
import { App } from 'octokit';

const secret = envs.GITHUB_WEBHOOKS_SECRET;
const app = new App({
  appId: envs.GITHUB_CLIENT_APPID,
  privateKey: envs.GITHUB_CLIENT_PKEY,
  webhooks: {
    secret,
  },
});

const ws: Webhooks = app.webhooks;

export const github: App = app;
export const webhookService = ws;
