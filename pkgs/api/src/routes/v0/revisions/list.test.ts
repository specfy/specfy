import type { Orgs, Projects, Users } from '@prisma/client';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedRevision } from '../../../test/seed/revisions';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

async function seedAllStates(user: Users, org: Orgs, project: Projects) {
  const revision1 = await seedRevision(user, org, project, { status: 'draft' });
  const revision2 = await seedRevision(user, org, project, {
    status: 'approved',
  });
  const revision3 = await seedRevision(user, org, project, {
    status: 'waiting',
  });
  const revision4 = await seedRevision(user, org, project, {
    status: 'closed',
  });
  const revision5 = await seedRevision(user, org, project, {
    status: 'approved',
    merged: true,
  });

  return { revision1, revision2, revision3, revision4, revision5 };
}

describe('GET /revisions', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/revisions');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should fail on unknown org/project', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: 'e', project_id: 'a' },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      org_id: {
        code: 'forbidden',
        message:
          "The organization doesn't exists or you don't have the permissions",
        path: ['org_id'],
      },
      project_id: {
        code: 'forbidden',
        message: "The project doesn't exists or you don't have the permissions",
        path: ['project_id'],
      },
    });
  });

  it('should list', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project, {
      status: 'waiting',
    });
    await seedRevision(user, org, project, { status: 'waiting' });

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(2);
    expect(res.json.data[1]).toStrictEqual({
      authors: [],
      blobs: [],
      closedAt: null,
      createdAt: expect.toBeIsoDate(),
      description: { content: [], type: 'doc' },
      id: revision.id,
      locked: false,
      merged: false,
      mergedAt: null,
      name: revision.name,
      orgId: org.id,
      projectId: project.id,
      status: 'waiting',
      updatedAt: expect.toBeIsoDate(),
      url: expect.any(String),
    });
  });

  it('should filter by status: approved', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision2 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: {
        org_id: org.id,
        project_id: project.id,
        status: 'approved',
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision2.id);
  });

  it('should filter by status: draft', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision1 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id, status: 'draft' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision1.id);
  });

  it('should filter by status: closed', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision4 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id, status: 'closed' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision4.id);
  });

  it('should filter by status: waiting', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision3 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: {
        org_id: org.id,
        project_id: project.id,
        status: 'waiting',
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision3.id);
  });

  it('should filter by status: all', async () => {
    const { token, org, project, user } = await seedWithProject();
    await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id, status: 'all' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(5);
  });

  it('should filter by status: opened', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision1, revision2, revision3 } = await seedAllStates(
      user,
      org,
      project
    );

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id, status: 'opened' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(3);
    expect(res.json.data[0].id).toStrictEqual(revision3.id);
    expect(res.json.data[1].id).toStrictEqual(revision2.id);
    expect(res.json.data[2].id).toStrictEqual(revision1.id);
  });

  it('should filter by status: merged', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision5 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: { org_id: org.id, project_id: project.id, status: 'merged' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision5.id);
  });

  it('should search in name', async () => {
    const { token, org, project, user } = await seedWithProject();
    const { revision4 } = await seedAllStates(user, org, project);

    const res = await t.fetch.get('/0/revisions', {
      token,
      Querystring: {
        org_id: org.id,
        project_id: project.id,
        status: 'all',
        search: revision4.id.substring(0, 4),
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(revision4.id);
  });
});
