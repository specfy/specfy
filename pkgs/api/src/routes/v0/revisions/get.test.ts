import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { createOrgId } from '../../../test/seed/orgs';
import { seedRevision } from '../../../test/seed/revisions';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a revision', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
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
      qp: { org_id: createOrgId(), project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      org_id: {
        code: 'forbidden',
        message:
          "The organization doesn't exists or you don't have the permissions",
        path: ['org_id'],
      },
    });
  });

  it('should error on wrong project id', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      qp: { org_id: org.id, project_id: nanoid() },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      project_id: {
        code: 'forbidden',
        message: "The project doesn't exists or you don't have the permissions",
        path: ['project_id'],
      },
    });
  });

  it('should error on wrong id format', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/revisions/-foI0bardfdk9834982`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
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
      qp: { org_id: org.id, project_id: project.id },
    });

    shouldBeNotFound(res);
  });
});
