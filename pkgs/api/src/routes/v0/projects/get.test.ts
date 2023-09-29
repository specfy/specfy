import { beforeAll, afterAll, describe, it, expect } from 'vitest';

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

describe('GET /projects/:project_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/projects/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/projects/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a project', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: project.orgId },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      id: project.id,
      name: project.name,
      orgId: project.orgId,
      slug: project.slug,
      blobId: expect.any(String),
      description: { content: [], type: 'doc' },
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      links: [],
    });
  });

  it('should error on wrong orgId', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: 'foobar' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should 403 on unknown project', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/foobar`, {
      token,
      Querystring: { org_id: project.orgId },
    });

    expect(res.statusCode).toBe(403);
  });
});
