import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import { slugify } from '../../../common/string';
import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeNotFound,
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should rename', async () => {
    const { token, org, project } = await seedWithProject();

    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/projects/${org.id}/${project.slug}`, {
      token,
      body: {
        name,
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
    await shouldBeNotFound(res2);

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
    const seed1 = await seedWithProject();
    const { token, org, project } = await seedWithProject();

    const name = seed1.project.name;
    const res = await t.fetch.put(`/0/projects/${org.id}/${project.slug}`, {
      token,
      body: {
        name,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      name: {
        code: 'exists',
        message: 'This slug is already used',
        path: ['name'],
      },
    });
  });

  it('should forbid other changes', async () => {
    const { token, org, project } = await seedWithProject();

    const res = await t.fetch.put(`/0/projects/${org.id}/${project.slug}`, {
      token,
      body: {
        // @ts-expect-error
        edges: [],
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
