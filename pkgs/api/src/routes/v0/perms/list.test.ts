import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /perms', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/perms');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/perms', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return one perm', async () => {
    const { token, user, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/perms', {
      token,
      Querystring: {
        org_id: org.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data).toStrictEqual([
      {
        createdAt: expect.toBeIsoDate(),
        id: expect.any(String),
        orgId: org.id,
        projectId: null,
        role: 'owner',
        updatedAt: expect.toBeIsoDate(),
        user: {
          avatarUrl: null,
          email: user.email,
          id: user.id,
          name: user.name,
        },
      },
    ]);
  });

  it('should not list the other user orgs', async () => {
    const seed1 = await seedWithOrg();
    const seed2 = await seedWithOrg();

    // First user receive only it's own org
    const res1 = await t.fetch.get('/0/perms', {
      token: seed1.token,
      Querystring: {
        org_id: seed1.org.id,
      },
    });
    isSuccess(res1.json);
    expect(res1.statusCode).toBe(200);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data[0].user.id).toStrictEqual(seed1.user.id);

    // Second user receive only it's own org
    const res2 = await t.fetch.get('/0/perms', {
      token: seed2.token,
      Querystring: {
        org_id: seed2.org.id,
      },
    });
    isSuccess(res2.json);
    expect(res2.statusCode).toBe(200);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data[0].user.id).toStrictEqual(seed2.user.id);
  });
});
