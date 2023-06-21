import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isError, isSuccess } from '../../../test/fetch';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedDocument } from '../../../test/seed/documents';
import { seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /documents/:id', () => {
  it('should be protected', async () => {
    const { project, org, user } = await seedWithProject();
    const document = await seedDocument(user, org, project);

    const res = await t.fetch.get(`/0/documents/${document.id}`);
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token, project, org, user } = await seedWithProject();
    const document = await seedDocument(user, org, project);
    const res = await t.fetch.get(`/0/documents/${document.id}`, {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a document', async () => {
    const { token, project, org, user } = await seedWithProject();
    const document = await seedDocument(user, org, project);
    const res = await t.fetch.get(`/0/documents/${document.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      approvedBy: [],
      authors: [],
      blobId: expect.any(String),
      content: {
        content: [],
        type: 'doc',
      },
      id: document.id,
      locked: false,
      name: document.name,
      orgId: org.id,
      projectId: project.id,
      reviewers: [],
      slug: document.slug,
      tldr: '',
      type: 'rfc',
      typeId: document.typeId,
      parentId: null,
      source: null,
      sourcePath: null,
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
    });
  });

  it('should not get a document with wrong org', async () => {
    const seed1 = await seedWithProject();
    const { token, project, org, user } = await seedWithProject();
    const document = await seedDocument(user, org, project);
    const res = await t.fetch.get(`/0/documents/${document.id}`, {
      token,
      Querystring: { org_id: seed1.org.id, project_id: seed1.project.id },
    });

    isError(res.json);
    expect(res.statusCode).toBe(400);
  });

  it('should not get a document with wrong id', async () => {
    const { token, project, org, user } = await seedWithProject();
    await seedDocument(user, org, project);
    const res = await t.fetch.get(`/0/documents/${nanoid()}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    shouldBeNotFound(res);
  });
});
