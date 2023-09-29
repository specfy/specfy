import { nanoid, l as logger } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  createGitHubActivity,
  createJobDeploy,
  userGitHubApp,
} from '@specfy/models';

import { webhookService as ws } from './app.js';

const l = logger.child({ svc: 'github' });

export function stop() {
  // nothing
}

export function start() {
  l.info('GitHub Service Starting');

  ws.onAny(({ id, payload, name }) => {
    if ('action' in payload) {
      l.info(`received "${name}.${payload.action}"`, { id });
    }
  });

  ws.on('repository.renamed', async ({ id, payload }) => {
    const prev = payload.changes.repository.name.from;
    const owner = payload.repository.owner;
    const full = payload.repository.full_name;

    const updatedSources = await prisma.sources.updateMany({
      where: { type: 'github', identifier: `${owner}/${prev}` },
      data: { name: `GitHub ${full}`, identifier: full },
    });

    l.info(`renamed ${updatedSources.count} sources`, { id });
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
          return createGitHubActivity({
            action: 'Github.unlinked',
            org,
            tx,
            user: userGitHubApp,
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
        const list = await tx.sources.findMany({
          where: { type: 'github', identifier: fullName },
        });
        l.info(`found ${list.length} projects`, { id });

        const sources = await prisma.sources.deleteMany({
          where: { type: 'github', identifier: fullName },
        });
        l.info(`updated ${sources.count} sources`, {
          id,
        });

        const activityGroupId = nanoid();
        await Promise.all(
          list.map((source) => {
            return createGitHubActivity({
              action: 'Github.unlinked',
              org: { id: source.orgId },
              project: { id: source.projectId },
              tx,
              user: userGitHubApp,
              activityGroupId,
            });
          })
        );
      });
      await Promise.all(p);
    });
  });

  ws.on('push', async ({ id, payload }) => {
    const split = payload.ref.split('/');
    const branch = split[split.length - 1];

    l.info(`repository push`, {
      id,
      repo: payload.repository.full_name,
      installId: payload.installation?.id,
      branch,
    });

    await prisma.$transaction(async (tx) => {
      const list = await tx.sources.findMany({
        where: {
          type: 'github',
          identifier: payload.repository.full_name,
          enable: true,
        },
      });

      await Promise.all(
        list.map((source) => {
          // TODO: Filter this at query time
          if (source.settings.branch !== branch) {
            return null;
          }

          return createJobDeploy({
            orgId: source.orgId,
            projectId: source.projectId,
            userId: userGitHubApp.id,
            config: {
              sourceId: source.id,
              url: source.identifier,
              hook: { id, ref: payload.ref },
              settings: source.settings,
            },
            tx,
          });
        })
      );
    });
  });
}
