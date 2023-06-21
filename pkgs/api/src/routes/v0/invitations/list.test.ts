import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
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

describe('GET /invitations', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/invitations');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/invitations', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return no invitations', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/invitations', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(0);
  });

  it('should list one invitation', async () => {
    const { token, org, user } = await seedWithOrg();

    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { email: 'foobar@example.com', orgId: org.id, role: 'viewer' },
    });
    isSuccess(post.json);

    const res = await t.fetch.get('/0/invitations', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data).toStrictEqual([
      {
        id: expect.any(String),
        email: 'foobar@example.com',
        role: 'viewer',
        userId: user.id,
        orgId: org.id,
        createdAt: expect.toBeIsoDate(),
        expiresAt: expect.toBeIsoDate(),
      },
    ]);

    expect(new Date(res.json.data[0].expiresAt).getTime()).toBeGreaterThan(
      Date.now() + 6 * 86400 * 1000
    );
  });

  it('should not list the other invitation orgs', async () => {
    const seed1 = await seedWithOrg();
    const seed2 = await seedWithOrg();

    const post1 = await t.fetch.post('/0/invitations', {
      token: seed1.token,
      Body: {
        email: 'foobar1@example.com',
        orgId: seed1.org.id,
        role: 'viewer',
      },
    });
    isSuccess(post1.json);

    const post2 = await t.fetch.post('/0/invitations', {
      token: seed2.token,
      Body: {
        email: 'foobar2@example.com',
        orgId: seed2.org.id,
        role: 'viewer',
      },
    });
    isSuccess(post2.json);

    // First user receive only it's own org
    const res1 = await t.fetch.get('/0/invitations', {
      token: seed1.token,
      Querystring: { org_id: seed1.org.id },
    });
    isSuccess(res1.json);
    expect(res1.statusCode).toBe(200);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data[0].email).toStrictEqual('foobar1@example.com');

    // Second user receive only it's own org
    const res2 = await t.fetch.get('/0/invitations', {
      token: seed2.token,
      Querystring: { org_id: seed2.org.id },
    });
    isSuccess(res2.json);
    expect(res2.statusCode).toBe(200);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data[0].email).toStrictEqual('foobar2@example.com');
  });

  it('should not be able to invite to an other org', async () => {
    const { token } = await seedWithOrg();
    const seed2 = await seedWithOrg();

    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: {
        email: 'foobar@example.com',
        orgId: seed2.org.id,
        role: 'viewer',
      },
    });
    isValidationError(post.json);
  });
});
