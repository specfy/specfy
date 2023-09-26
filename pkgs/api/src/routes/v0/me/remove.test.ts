import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowBody,
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

describe('DELETE /me', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/me');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/me', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/me', {
      token,
      // @ts-expect-error
      Body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should delete me', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete(`/0/me`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // Check that it's indeed deleted
    // It's normal that we can still query because JWTs are not expired
    const resGet = await t.fetch.get(`/0/me`, {
      token,
    });
    isSuccess(resGet.json);
    expect(resGet.json.data.name).toBe('Deleted Account');
  });
});
