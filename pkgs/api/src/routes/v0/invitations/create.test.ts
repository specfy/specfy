import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
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

describe('POST /invitations', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/invitations');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/invitations', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/invitations', 'POST');
  });

  it('should create one invitation', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      id: expect.any(String),
      token: expect.any(String),
    });
  });

  it('should reject already user', async () => {
    const { token, org } = await seedWithOrg();
    const user2 = await seedSimpleUser(org);
    const res = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: user2.user.email, role: 'viewer' },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      email: {
        code: 'exists',
        message: 'User is already part of this organization',
        path: ['email'],
      },
    });
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
    expect(post.statusCode).toBe(403);
  });
});
