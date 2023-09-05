import { prisma } from '@specfy/db';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
import {
  seedSimpleUser,
  seedWithOrgViewer,
  seedWithProject,
} from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /jobs', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/jobs');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/jobs', {
      token,
      Body: {
        orgId: '',
        projectId: '',
        type: 'deploy',
      },
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/jobs', 'POST');
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const res = await t.fetch.post('/0/jobs', {
      token,
      Body: {
        orgId: org.id,
        projectId: project.id,
        type: 'deploy',
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should failed to create because project is not linked to Github', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.post('/0/jobs', {
      token,
      Body: {
        orgId: project.orgId,
        projectId: project.id,
        type: 'deploy',
      },
    });

    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json).toStrictEqual({
      error: {
        code: 'failed_to_create_job',
        reason: 'no_project_repository',
      },
    });
  });

  it('should create one job', async () => {
    const { token, project, user } = await seedWithProject();
    await prisma.projects.update({
      data: { githubRepository: 'test' },
      where: { id: project.id },
    });
    const res = await t.fetch.post('/0/jobs', {
      token,
      Body: {
        orgId: project.orgId,
        projectId: project.id,
        type: 'deploy',
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      config: {
        url: 'test',
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
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      finishedAt: null,
      id: expect.any(String),
      orgId: project.orgId,
      projectId: project.id,
      reason: null,
      startedAt: null,
      status: 'pending',
      type: 'deploy',
      typeId: 1,
      user: {
        avatarUrl: null,
        email: user.email,
        id: user.id,
        name: user.name,
      },
    });
  });
});
