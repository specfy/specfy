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

describe('GET /catalog/:tech_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/catalog/foobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/catalog/foobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return 404', async () => {
    const { org, token } = await seedWithOrg();
    const res = await t.fetch.get('/0/catalog/foobar', {
      token,
      Querystring: { org_id: org.id },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should return a catalog detail', async () => {
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

    const res = await t.fetch.get('/0/catalog/algolia', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      byProject: [project.id],
      tech: { key: 'algolia', name: 'Algolia', type: 'saas' },
    });
  });
});
