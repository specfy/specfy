import { nanoid } from '@specfy/core';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeNotFound,
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

describe('GET /users/:user_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/users/foo');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/users/foo', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a myself', async () => {
    const { token, user } = await seedSimpleUser();
    const res = await t.fetch.get(`/0/users/${user.id}`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      avatarUrl: null,
      githubLogin: null,
      id: user.id,
      name: `User ${user.id}`,
    });
  });

  it('should get another user', async () => {
    const { token } = await seedSimpleUser();
    const { user } = await seedSimpleUser();
    const res = await t.fetch.get(`/0/users/${user.id}`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      avatarUrl: null,
      githubLogin: null,
      id: user.id,
      name: `User ${user.id}`,
    });
  });

  it('should error on wrong userId', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get(`/0/users/foobar`, {
      token,
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      user_id: {
        code: 'too_small',
        message: 'String must contain at least 10 character(s)',
        path: ['user_id'],
      },
    });
  });

  it('should 404', async () => {
    const { token } = await seedSimpleUser();
    const id = nanoid();
    const res = await t.fetch.get(`/0/users/${id}`, {
      token,
    });

    shouldBeNotFound(res);
  });
});
