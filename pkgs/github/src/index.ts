import { github, webhookService, Octokit } from './app.js';
import { listen as deployListen, off as deployOff } from './service.js';
import { listen as webhookListen } from './webhooks.js';

export { github, webhookService, Octokit };

export async function start() {
  webhookListen();
  deployListen();
}

export async function stop() {
  await deployOff();
}
