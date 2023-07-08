import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import { shouldNotAllowQueryParams } from '../../../test/helpers.js';
import { seedSimpleUser } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /me', () => {
  it('should not be protected', async () => {
    const res = await t.fetch.get('/0/');
    isSuccess(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get me', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/', { token });

    isSuccess(res.json);
    expect(res.json).toStrictEqual({
      root: true,
    });
  });
});
