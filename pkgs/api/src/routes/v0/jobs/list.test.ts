import { prisma } from '@specfy/db';
import { createJobDeploy, jobReason } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { Orgs, Projects, Users } from '@specfy/db';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

async function seedAllStates(org: Orgs, proj: Projects, user: Users) {
  await prisma.$transaction(async (tx) => {
    const config = { url: 'specfy/sync', project: proj.config };
    await Promise.all([
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'cancelled',
        config,
        tx,
      }),
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'skipped',
        config,
        tx,
      }),
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'failed',
        config,
        reason: {
          status: 'failed',
          code: 'org_not_installed',
          reason: jobReason.org_not_installed,
        },
        tx,
      }),
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'timeout',
        config,
        tx,
      }),
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'running',
        config,
        startedAt: new Date(),
        tx,
      }),
      createJobDeploy({
        orgId: org.id,
        projectId: proj.id,
        userId: user.id,
        status: 'success',
        config,
        tx,
      }),
    ]);
  });
}

describe('GET /jobs', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/jobs');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/jobs', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should fail on unknown org/project', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/jobs', {
      token,
      Querystring: { org_id: 'eaaaa', project_id: 'aaaaaaaaaa' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should list', async () => {
    const { token, org, project, user } = await seedWithProject();
    await seedAllStates(org, project, user);

    const res = await t.fetch.get('/0/jobs', {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(6);
    expect(res.json.data[1]).toStrictEqual({
      config: {
        url: 'specfy/sync',
        project: {
          branch: 'main',
          documentation: {
            enabled: true,
            path: '/',
          },
          stack: {
            enabled: true,
            path: '/',
          },
        },
      },
      id: expect.any(String),
      orgId: expect.any(String),
      projectId: expect.any(String),
      reason: null,
      status: 'running',
      type: 'deploy',
      typeId: expect.any(Number),
      user: {
        avatarUrl: null,
        email: user.email,
        id: user.id,
        name: user.name,
      },
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      startedAt: expect.toBeIsoDate(),
      finishedAt: null,
    });
    expect(res.json.data[3].reason).toStrictEqual({
      code: 'org_not_installed',
      reason: 'Specfy App is not installed on the GitHub organization',
      status: 'failed',
    });
  });
});
