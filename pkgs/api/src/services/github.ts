import { App } from 'octokit';

import { env } from '../common/env';
import { nanoid } from '../common/id';
import { prisma } from '../db';
import { l as consola } from '../logger';
import { userGithubApp } from '../models';
import { createGithubActivity } from '../models/github';

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
  const owner = payload.repository.owner;

  const updated = await prisma.projects.updateMany({
    where: { githubRepository: `${owner}/${prev}`, name: prev },
    data: { name: next, githubRepository: payload.repository.full_name },
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

  await prisma.$transaction(async (tx) => {
    const list = await tx.orgs.findMany({
      where: { githubInstallationId: payload.installation.id },
    });
    l.info(`found ${list.length} orgs`, { id });

    const updated = await tx.orgs.updateMany({
      where: { githubInstallationId: payload.installation.id },
      data: { githubInstallationId: null },
    });
    l.info(`updated ${updated.count} orgs`, { id });

    const activityGroupId = nanoid();
    await Promise.all(
      list.map((org) => {
        return createGithubActivity({
          action: 'Github.unlinked',
          org,
          tx,
          user: userGithubApp,
          activityGroupId,
        });
      })
    );
  });
});

// ws.on('installation.suspend', async ({ payload }) => {});

// ws.on('installation.unsuspend', async ({ payload }) => {});

// ws.on('installation_repositories.added', async ({ payload }) => {});
ws.on('installation_repositories.removed', async ({ id, payload }) => {
  const fullNames = payload.repositories_removed.map((repo) => {
    return repo.full_name;
  });

  l.info(`repository removed`, {
    id,
    installId: payload.installation.id,
    installBy: payload.installation.account.login,
    removed: fullNames,
  });

  await prisma.$transaction(async (tx) => {
    const p = fullNames.map(async (fullName) => {
      const list = await tx.projects.findMany({
        where: { githubRepository: fullName },
        include: { Org: true },
      });
      l.info(`found ${list.length} projects`, { id });

      const updated = await tx.projects.updateMany({
        where: { githubRepository: fullName },
        data: { githubRepository: null },
      });
      l.info(`updated ${updated.count} projects`, { id });

      const activityGroupId = nanoid();
      await Promise.all(
        list.map((project) => {
          return createGithubActivity({
            action: 'Github.unlinked',
            org: project.Org,
            project,
            tx,
            user: userGithubApp,
            activityGroupId,
          });
        })
      );
    });
    await Promise.all(p);
  });
});
