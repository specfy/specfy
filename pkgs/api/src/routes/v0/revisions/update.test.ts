import { nanoid } from '@specfy/core';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
import { seedRevision } from '../../../test/seed/revisions.js';
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

describe('PATCH /revisions/:revision_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.patch('/0/revisions/foo');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.patch('/0/revisions/foo', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const revision = await seedRevision(owner, org, project);

    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { status: 'closed' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should forbid to change status and name', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { status: 'closed', name: 'hello' },
    });
    isValidationError(res.json);
  });

  it('should close a revision', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { status: 'closed' },
    });
    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({ done: true });

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.status).toStrictEqual('closed');
    expect(get.json.data.closedAt).toBeTruthy();
  });

  it('should lock a revision', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { locked: true },
    });
    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({ done: true });

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.locked).toStrictEqual(true);
  });

  it('should reopen a revision', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project, {
      status: 'closed',
    });

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { status: 'draft' },
    });
    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({ done: true });

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.status).toStrictEqual('draft');
    expect(get.json.data.closedAt).toBeNull();
  });

  it('should update a revision', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: {
        name: 'hello',
        description: {
          content: [{ type: 'horizontalRule', attrs: { uid: nanoid() } }],
          type: 'doc',
        },
      },
    });
    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({ done: true });

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.name).toStrictEqual('hello');
    expect(get.json.data.description.content).toHaveLength(1);
  });

  it('should reject adding same user to authors and reviewers', async () => {
    const { token, org, user, project } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: {
        authors: [user.id],
        reviewers: [user.id],
      },
    });
    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      authors: {
        code: 'presence',
        message: "Authors can't be Reviewers too",
        path: ['authors'],
      },
    });
  });

  it('should add authors and reviewers', async () => {
    const { token, org, user, project } = await seedWithProject();
    const user2 = await seedSimpleUser(org);
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: {
        authors: [user.id],
        reviewers: [user2.user.id],
      },
    });
    isSuccess(res.json);

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.authors).toHaveLength(1);
    expect(get.json.data.authors[0].id).toBe(user.id);
    expect(get.json.data.reviewers).toHaveLength(1);
    expect(get.json.data.reviewers[0].id).toBe(user2.user.id);
  });

  it('should remove authors and reviewers', async () => {
    const { token, org, user, project } = await seedWithProject();
    const user2 = await seedSimpleUser(org);
    const revision = await seedRevision(user, org, project);

    // Updates
    const res = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: {
        authors: [user.id],
        reviewers: [user2.user.id],
      },
    });
    isSuccess(res.json);

    // Removes
    const res2 = await t.fetch.patch(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: {
        authors: [],
        reviewers: [],
      },
    });
    isSuccess(res2.json);

    // Get changes
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.authors).toHaveLength(0);
    expect(get.json.data.reviewers).toHaveLength(0);
  });

  // TODO: blobs
});
