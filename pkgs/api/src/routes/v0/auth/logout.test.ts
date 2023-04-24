import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import {
  shouldNotAllowBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /logout', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/auth/logout');
    expect(res.statusCode).toBe(401);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/logout', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/logout', {
      token,
      // @ts-expect-error
      body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should return empty on success', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/logout', {
      token,
    });
    expect(res.statusCode).toBe(204);
  });
});
