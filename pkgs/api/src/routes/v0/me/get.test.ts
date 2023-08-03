import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /me', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/me');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/me', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get me', async () => {
    const { token, user } = await seedSimpleUser();
    const res = await t.fetch.get('/0/me', { token });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({
      email: user.email,
      id: user.id,
      name: user.name,
      avatarUrl: null,
      token: expect.any(String),
      perms: [],
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
    });
  });
});
