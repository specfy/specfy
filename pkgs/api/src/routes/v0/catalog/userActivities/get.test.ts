import { setTimeout } from 'timers/promises';

import { nanoid } from '@specfy/core';
import { indexCommits } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../../test/each.js';
import { isSuccess } from '../../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../../test/helpers.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithProject,
} from '../../../../test/seed/seed.js';

import type { TestSetup } from '../../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /catalog/:tech_id/user_activities', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/catalog/docker/user_activities');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/catalog/docker/user_activities', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return empty catalog', async () => {
    const { org, token } = await seedWithOrg();
    const res = await t.fetch.get('/0/catalog/docker/user_activities', {
      token,
      Querystring: { org_id: org.id },
    });

    expect(res.statusCode).toBe(404);
  });

  it('should return a catalog', async () => {
    const { org, token, project, user } = await seedWithProject();
    await indexCommits({
      commits: [
        {
          orgId: org.id,
          projectId: project.id,
          sourceId: nanoid(),
          hash: nanoid(),
          techs: ['algolia'],
          date: new Date().toISOString(),
          authors: [{ id: user.id, name: user.name, email: user.email }],
        },
      ],
    });

    // Oh lord its the first one
    await setTimeout(500);

    const res = await t.fetch.get('/0/catalog/algolia/user_activities', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      histogram: [{ count: 1, date: expect.any(Number) }],
      total: 1,
      totalForTech: 1,
      users: [
        {
          count: 1,
          firstUpdate: expect.any(Number),
          lastUpdate: expect.any(Number),
          profile: {
            avatarUrl: null,
            githubLogin: null,
            id: user.id,
            name: user.name,
          },
          score: 5,
          trend: 'bad',
          type: 'user',
        },
      ],
    });
  });
});
