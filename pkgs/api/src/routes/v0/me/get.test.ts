import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
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

describe('GET /me', () => {
  it('should be protected', async () => {
    await shouldBeProtected(t.fetch, '/0/me', 'GET');
  });

  it('should not allow query params', async () => {
    await shouldNotAllowQueryParams(t.fetch, '/0/me', 'GET');
  });

  it('should get me', async () => {
    const { token, user } = await seedSimpleUser();
    const res = await t.fetch.get('/0/me', { token });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({
      createdAt: expect.toBeIsoDate(),
      email: user.email,
      id: user.id,
      name: user.name,
      updatedAt: expect.toBeIsoDate(),
    });
  });
});
