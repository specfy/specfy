import { l } from '@specfy/core';
import { indexTech } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithProject,
} from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /catalog', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/catalog');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/catalog', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return empty catalog', async () => {
    const { org, token } = await seedWithOrg();
    const res = await t.fetch.get('/0/catalog', {
      token,
      Querystring: { org_id: org.id, type: 'all' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({ byName: [], byType: [] });
  });

  it('should return a catalog', async () => {
    const { org, token, project } = await seedWithProject();
    await indexTech({
      techs: [
        {
          jobId: 'a',
          key: 'algolia',
          name: 'Algolia',
          orgId: org.id,
          projectId: project.id,
          type: 'saas',
        },
      ],
      l,
    });

    const res = await t.fetch.get('/0/catalog', {
      token,
      Querystring: { org_id: org.id, type: 'all' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      byName: [
        {
          count: 1,
          key: 'algolia',
        },
      ],
      byType: [
        {
          count: 1,
          key: 'saas',
        },
      ],
    });
  });
});
