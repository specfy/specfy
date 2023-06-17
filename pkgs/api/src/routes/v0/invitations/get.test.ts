import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isError, isSuccess } from '../../../test/fetch';
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

describe('GET /invitations/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/invitations/foobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/invitations/foobar', {
      token,
      // @ts-expect-error
      qp: { random: 'world', token: 'top' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not get an invitation that does not belong to user', async () => {
    const { token, org } = await seedWithOrg();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Get
    const get = await t.fetch.get(`/0/invitations/${post.json.data.id}`, {
      token,
      qp: { token: post.json.data.token },
    });
    isError(get.json);
    expect(get.statusCode).toBe(403);
  });

  it('should get one invitation', async () => {
    const { token, org, user } = await seedWithOrg();
    const seed2 = await seedSimpleUser();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: seed2.user.email, role: 'viewer' },
    });
    isSuccess(post.json);

    // Get
    const get = await t.fetch.get(`/0/invitations/${post.json.data.id}`, {
      token: seed2.token,
      qp: { token: post.json.data.token },
    });
    isSuccess(get.json);
    expect(get.statusCode).toBe(200);
    expect(get.json.data).toStrictEqual({
      email: seed2.user.email,
      expiresAt: expect.toBeIsoDate(),
      id: expect.any(String),
      orgId: org.id,
      role: 'viewer',
      userId: user.id,
      by: {
        avatarUrl: null,
        email: expect.any(String),
        id: user.id,
        name: expect.any(String),
      },
      org: {
        id: org.id,
        acronym: expect.any(String),
        avatarUrl: null,
        color: expect.any(String),
        isPersonal: false,
        name: expect.any(String),
      },
    });
  });

  it('should reject not found invitations', async () => {
    const { token } = await seedWithOrg();
    const fakeid = nanoid();
    const res = await t.fetch.get(`/0/invitations/${fakeid}`, {
      token,
      qp: { token: nanoid(32) },
    });

    isError(res.json);
    expect(res.statusCode).toBe(404);
  });
});
