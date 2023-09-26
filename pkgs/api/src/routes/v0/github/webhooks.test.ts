import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { shouldNotAllowQueryParams } from '../../../test/helpers.js';
import { seedSimpleUser } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /github/webhooks', () => {
  it('should not be protected ny regular auth', async () => {
    const res = await t.fetch.post('/0/github/webhooks');
    expect(res.statusCode).toBe(403);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/github/repos', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });
});
