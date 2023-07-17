import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id.js';
import { slugify } from '../../../common/string.js';
import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('PUT /projects/:org_id/:project_slug', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/projects/foo/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/projects/foo/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should rename', async () => {
    const { token, org, project } = await seedWithProject();

    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/projects/${org.id}/${project.slug}`, {
      token,
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
    const res2 = await t.fetch.get(`/0/projects/${org.id}/${project.slug}`, {
      token,
    });
    shouldBeNotFound(res2);

    // We check if new slug is accessible
    const res3 = await t.fetch.get(
      `/0/projects/${org.id}/${res.json.data.slug}`,
      {
        token,
      }
    );
    isSuccess(res3.json);
  });

  it('should prevent slug conflict', async () => {
    const { token, user, org, project } = await seedWithProject();
    const seed2 = await seedProject(user, org);

    const res = await t.fetch.put(`/0/projects/${org.id}/${seed2.slug}`, {
      token,
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

    const res = await t.fetch.put(`/0/projects/${org.id}/${project.slug}`, {
      token,
      Body: {
        // @ts-expect-error
        edges: [],
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
