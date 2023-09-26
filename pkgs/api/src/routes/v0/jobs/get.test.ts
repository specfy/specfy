import { nanoid } from '@specfy/core';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedJob } from '../../../test/seed/jobs.js';
import { createOrgId } from '../../../test/seed/orgs.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /jobs/:job_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/jobs/foo');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/jobs/foo', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a job', async () => {
    const { token, org, project, user } = await seedWithProject();
    const job = await seedJob(user, org, project);
    const res = await t.fetch.get(`/0/jobs/${job.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      config: {
        url: 'hello',
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
      orgId: project.orgId,
      projectId: project.id,
      reason: null,
      revisionId: null,
      status: 'pending',
      type: 'deploy',
      logs: '',
      typeId: expect.any(Number),
      user: {
        avatarUrl: null,
        email: user.email,
        id: user.id,
        name: user.name,
      },
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      startedAt: null,
      finishedAt: null,
    });
  });

  it('should error on wrong orgId', async () => {
    const { token, project, user, org } = await seedWithProject();
    const job = await seedJob(user, org, project);
    const res = await t.fetch.get(`/0/jobs/${job.id}`, {
      token,
      Querystring: { org_id: createOrgId(), project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should error on wrong project id', async () => {
    const { token, org, user, project } = await seedWithProject();
    const job = await seedJob(user, org, project);
    const res = await t.fetch.get(`/0/jobs/${job.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: nanoid() },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should error on wrong id format', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/jobs/-foI0bardfdk9834982`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      job_id: {
        code: 'invalid_string',
        message: 'Invalid',
        path: ['job_id'],
      },
    });
  });

  it('should 404', async () => {
    const { token, org, project } = await seedWithProject();
    const id = nanoid();
    const res = await t.fetch.get(`/0/jobs/${id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    shouldBeNotFound(res);
  });
});
