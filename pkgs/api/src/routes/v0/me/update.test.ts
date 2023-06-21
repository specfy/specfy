import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
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

describe('PUT /me', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/me');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/me', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should change display name', async () => {
    const { token } = await seedSimpleUser();

    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/me`, {
      token,
      Body: {
        name,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data.name).toStrictEqual(name);
  });

  it('should forbid other changes', async () => {
    const { token } = await seedSimpleUser();

    const res = await t.fetch.put(`/0/me`, {
      token,
      Body: {
        // @ts-expect-error
        email: 'dfdfd',
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
