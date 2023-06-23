import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /projects/:org_id/:project_slug', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/projects/foo/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/projects/foo/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a project', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/${org.id}/${project.slug}`, {
      token,
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
      display: {
        zIndex: 1,
        size: { height: 32, width: 100 },
        pos: { x: 20, y: 10 },
      },
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
      edges: [],
      links: [],
    });
  });

  it('should error on wrong orgId', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/foobar/${project.slug}`, {
      token,
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

  it('should error on wrong format projectId', async () => {
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/${org.id}/foI0bar`, {
      token,
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      project_slug: {
        code: 'invalid_string',
        message: 'Should only be lowercase letters, numbers and hyphen',
        path: ['project_slug'],
      },
    });
  });

  it('should 404 on unknown project', async () => {
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get(`/0/projects/${org.id}/foobar`, {
      token,
    });

    shouldBeNotFound(res);
  });
});
