import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import {
  shouldNotAllowBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /components', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/auth/logout');
    expect(res.statusCode).toBe(400);
  });

  it('should not allow query params', async () => {
    const res = await t.fetch.post('/0/auth/logout', {
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const res = await t.fetch.post('/0/auth/logout', {
      // @ts-expect-error
      body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });
});
