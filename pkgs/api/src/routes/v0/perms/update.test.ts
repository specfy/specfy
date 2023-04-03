import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('PUT /perms', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/perms');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/perms', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should create a perm', async () => {
    const user1 = await seedSimpleUser();
    const { token, org } = await seedWithOrg();

    // Create permission
    const res = await t.fetch.put('/0/perms', {
      token,
      body: {
        org_id: org.id,
        userId: user1.user.id,
        role: 'contributor',
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({ done: true });

    // We check if creation applied
    const resGet2 = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });
    isSuccess(resGet2.json);
    expect(resGet2.statusCode).toBe(200);
    expect(resGet2.json.data).toHaveLength(2);
    expect(resGet2.json.data[0].role).toBe('owner');
    expect(resGet2.json.data[1].role).toBe('contributor');
  });

  it('should update our own perm', async () => {
    const { token, user, org } = await seedWithOrg();

    // Initial get
    const resGet1 = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });

    isSuccess(resGet1.json);
    expect(resGet1.statusCode).toBe(200);
    expect(resGet1.json.data).toHaveLength(1);
    expect(resGet1.json.data[0].role).toBe('owner');

    // Update our permission
    const res = await t.fetch.put('/0/perms', {
      token,
      body: {
        org_id: org.id,
        userId: user.id,
        role: 'contributor',
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({ done: true });

    // We check if update applied
    const resGet2 = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });
    isSuccess(resGet2.json);
    expect(resGet2.statusCode).toBe(200);
    expect(resGet2.json.data).toHaveLength(1);
    expect(resGet2.json.data[0].role).toBe('contributor');
  });
});
