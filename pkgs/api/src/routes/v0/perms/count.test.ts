import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /perms/count', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/perms/count');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/perms/count', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return one perm', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/perms/count', {
      token,
      Querystring: {
        org_id: org.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toBe(1);
  });
});
