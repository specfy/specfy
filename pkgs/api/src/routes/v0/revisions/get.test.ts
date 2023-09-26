import { nanoid } from '@specfy/core';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { createOrgId } from '../../../test/seed/orgs.js';
import { seedRevision } from '../../../test/seed/revisions.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions/:revision_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/revisions/foo');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions/foo', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a revision', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      authors: [
        {
          avatarUrl: null,
          email: user.email,
          id: user.id,
          name: user.name,
        },
      ],
      blobs: [],
      closedAt: null,
      description: { type: 'doc', content: [] },
      id: revision.id,
      locked: false,
      merged: false,
      mergedAt: null,
      name: revision.name,
      orgId: org.id,
      projectId: project.id,
      reviewers: [],
      stack: null,
      status: 'draft',
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      url: expect.any(String),
    });
  });

  it('should error on wrong orgId', async () => {
    const { token, project, user, org } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: createOrgId(), project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should error on wrong project id', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: nanoid() },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should error on wrong id format', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/revisions/-foI0bardfdk9834982`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      revision_id: {
        code: 'invalid_string',
        message: 'Invalid',
        path: ['revision_id'],
      },
    });
  });

  it('should 404', async () => {
    const { token, org, project } = await seedWithProject();
    const id = nanoid();
    const res = await t.fetch.get(`/0/revisions/${id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    shouldBeNotFound(res);
  });
});
