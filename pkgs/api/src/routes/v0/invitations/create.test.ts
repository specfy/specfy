import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
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
      qp: { random: 'world' },
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
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
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
      body: { orgId: org.id, email: user2.user.email, role: 'viewer' },
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
});
