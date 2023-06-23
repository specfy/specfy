import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id.js';
import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

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
      Querystring: { random: 'world', token: 'top' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not get an invitation that does not belong to user', async () => {
    const { token, org } = await seedWithOrg();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Get
    const get = await t.fetch.get(`/0/invitations/${post.json.data.id}`, {
      token,
      Querystring: { token: post.json.data.token },
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
      Body: { orgId: org.id, email: seed2.user.email, role: 'viewer' },
    });
    isSuccess(post.json);

    // Get
    const get = await t.fetch.get(`/0/invitations/${post.json.data.id}`, {
      token: seed2.token,
      Querystring: { token: post.json.data.token },
    });
    isSuccess(get.json);
    expect(get.statusCode).toBe(200);
    expect(get.json.data).toStrictEqual({
      email: seed2.user.email,
      id: expect.any(String),
      orgId: org.id,
      role: 'viewer',
      userId: user.id,
      createdAt: expect.toBeIsoDate(),
      expiresAt: expect.toBeIsoDate(),
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
        githubInstallationId: null,
      },
    });
  });

  it('should reject not found invitations', async () => {
    const { token } = await seedWithOrg();
    const fakeid = nanoid();
    const res = await t.fetch.get(`/0/invitations/${fakeid}`, {
      token,
      Querystring: { token: nanoid(32) },
    });

    isError(res.json);
    expect(res.statusCode).toBe(404);
  });
});
