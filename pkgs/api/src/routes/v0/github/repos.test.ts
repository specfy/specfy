import { beforeAll, afterAll, describe, it } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /github/repos', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/github/repos');
    await shouldBeProtected(res);
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
