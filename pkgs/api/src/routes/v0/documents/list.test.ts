import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedDocument } from '../../../test/seed/documents';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /documents', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/documents');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/documents', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return no documents', async () => {
    const { token, project, org } = await seedWithProject();
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    res.json.data;
  });

  it('should list one document', async () => {
    const { token, org, user, project } = await seedWithProject();
    const document = await seedDocument(user, org, project);
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data).toStrictEqual([
      {
        id: document.id,
        name: document.name,
        slug: document.slug,
        tldr: '',
        type: document.type,
        typeId: document.typeId,
        createdAt: expect.toBeIsoDate(),
        updatedAt: expect.toBeIsoDate(),
      },
    ]);
  });

  it('should not list the other user orgs', async () => {
    const seed1 = await seedWithProject();
    const document1 = await seedDocument(seed1.user, seed1.org, seed1.project);
    const seed2 = await seedWithProject();
    const document2 = await seedDocument(seed2.user, seed2.org, seed2.project);

    // First user receive only it's own org
    const res1 = await t.fetch.get('/0/documents', {
      token: seed1.token,
      qp: { org_id: seed1.org.id, project_id: seed1.project.id },
    });
    isSuccess(res1.json);
    expect(res1.statusCode).toBe(200);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data[0].id).toStrictEqual(document1.id);

    // Second user receive only it's own org
    const res2 = await t.fetch.get('/0/documents', {
      token: seed2.token,
      qp: { org_id: seed2.org.id, project_id: seed2.project.id },
    });
    isSuccess(res2.json);
    expect(res2.statusCode).toBe(200);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data[0].id).toStrictEqual(document2.id);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: { org_id: seed1.org.id, project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('org_id');
  });

  it('should filter by type: rfc', async () => {
    const { token, project, org, user } = await seedWithProject();
    const document1 = await seedDocument(user, org, project, 'rfc');
    await seedDocument(user, org, project, 'pb');
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: { org_id: org.id, project_id: project.id, type: 'rfc' },
    });

    isSuccess(res.json);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(document1.id);
  });

  it('should filter by type: rfc', async () => {
    const { token, project, org, user } = await seedWithProject();
    await seedDocument(user, org, project, 'rfc');
    const document2 = await seedDocument(user, org, project, 'pb');
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: { org_id: org.id, project_id: project.id, type: 'pb' },
    });

    isSuccess(res.json);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(document2.id);
  });

  it('should filter by name', async () => {
    const { token, project, org, user } = await seedWithProject();
    await seedDocument(user, org, project, 'rfc');
    const document2 = await seedDocument(user, org, project, 'rfc');
    const res = await t.fetch.get('/0/documents', {
      token,
      qp: {
        org_id: org.id,
        project_id: project.id,
        search: document2.id.substring(0, 4),
      },
    });

    isSuccess(res.json);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(document2.id);
  });
});
