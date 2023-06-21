import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedPolicy } from '../../../test/seed/policies';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /policies', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/policies');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/policies', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list', async () => {
    const { token, user, org } = await seedWithOrg();
    const policy = await seedPolicy(user, org);
    const res = await t.fetch.get('/0/policies', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        content: {
          content: [],
          type: 'doc',
        },
        id: policy.id,
        orgId: org.id,
        name: null,
        tech: 'php',
        type: 'ban',
        createdAt: expect.toBeIsoDate(),
        updatedAt: expect.toBeIsoDate(),
      },
    ]);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithOrg();

    // Seed a second time
    const { token } = await seedWithOrg();
    const res = await t.fetch.get('/0/policies', {
      token,
      Querystring: { org_id: seed1.org.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('org_id');
  });
});
