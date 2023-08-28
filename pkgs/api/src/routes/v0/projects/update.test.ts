import { nanoid, slugify } from '@specfy/core';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
  shouldBeProtected,
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

describe('PUT /projects/:project_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/projects/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/projects/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        name,
        slug: slugify(name),
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should rename', async () => {
    const { token, org, project } = await seedWithProject();

    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        name,
        slug: slugify(name),
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data.name).toStrictEqual(name);
    expect(res.json.data.slug).toStrictEqual(slugify(name));

    // We check if old slug is not accessible anymore
    const res2 = await t.fetch.get(`/0/projects/by_slug`, {
      token,
      Querystring: { org_id: org.id, slug: project.slug },
    });
    shouldBeNotFound(res2);

    // We check if new slug is accessible
    const res3 = await t.fetch.get(`/0/projects/by_slug`, {
      token,
      Querystring: { org_id: org.id, slug: res.json.data.slug },
    });
    isSuccess(res3.json);
  });

  it('should prevent slug conflict', async () => {
    const { token, user, org, project } = await seedWithProject();
    const seed2 = await seedProject(user, org);

    const res = await t.fetch.put(`/0/projects/${seed2.id}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        name: 'foobar',
        slug: project.slug,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      slug: {
        code: 'exists',
        message: 'This slug is already used',
        path: ['slug'],
      },
    });
  });

  it('should forbid other changes', async () => {
    const { token, org, project } = await seedWithProject();

    const res = await t.fetch.put(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        // @ts-expect-error
        edges: [],
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });

  it('should update config', async () => {
    const { token, org, project } = await seedWithProject();

    const config = {
      branch: 'top',
      stack: { enabled: false, path: '/tip/top' },
      documentation: { enabled: false, path: '/foobar' },
    };
    const res = await t.fetch.put(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        config,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data.config).toStrictEqual({
      ...config,
    });
  });
});
