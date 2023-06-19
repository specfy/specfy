import { App } from 'octokit';

import { env } from '../common/env';
import { prisma } from '../db';
import { l as consola } from '../logger';

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

const l = consola.create({}).withTag('webhook');

ws.onAny(({ id, payload, name }) => {
  if ('action' in payload) {
    l.info(`received "${name}.${payload.action}"`, { id });
  }
});

ws.on('repository.renamed', async ({ id, payload }) => {
  const prev = payload.changes.repository.name.from;
  const next = payload.repository.name;
  const repoId = payload.repository.id;

  const updated = await prisma.projects.updateMany({
    where: { githubRepositoryId: repoId, name: prev },
    data: { name: next },
  });

  l.info(`renamed ${updated.count} projects`, { id });
});

ws.on('installation.created', async ({ id, payload }) => {
  l.info(`installation created`, {
    id,
    installId: payload.installation.id,
    installBy: payload.installation.account.login,
  });
});

ws.on('installation.deleted', async ({ id, payload }) => {
  l.info(`installation deleted`, {
    id,
    installId: payload.installation.id,
    installBy: payload.installation.account.login,
  });

  const updated = await prisma.orgs.updateMany({
    where: { githubInstallationId: payload.installation.id },
    data: { githubInstallationId: null },
  });
  l.info(`unlinked ${updated.count} projects`, { id });
});

// ws.on('installation.suspend', async ({ payload }) => {});

// ws.on('installation.unsuspend', async ({ payload }) => {});

// ws.on('installation_repositories.added', async ({ payload }) => {});
// ws.on('installation_repositories.removed', async ({ payload }) => {});
