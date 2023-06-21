import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import { shouldNotAllowQueryParams } from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /auth/local', () => {
  it('should not be protected', async () => {
    const res = await t.fetch.post('/0/auth/local', {
      // @ts-expect-error
      Body: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('should not allow query params', async () => {
    const res = await t.fetch.post('/0/auth/local', {
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should login with proper credentials', async () => {
    const { user, pwd } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/local', {
      Body: { email: user.email, password: pwd },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual({
      done: true,
    });
  });

  it('should disallow unknown account', async () => {
    const res = await t.fetch.post('/0/auth/local', {
      Body: { email: 'foo@bar.com', password: 'dkjfdkfjdkfj' },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      email: {
        code: 'unknown',
        message: 'This account does not exists.',
        path: [],
      },
    });
  });

  it('should disallow bad password', async () => {
    const { user } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/local', {
      Body: { email: user.email, password: 'sdfdfkdjfksjfk' },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      password: {
        code: 'invalid',
        message: 'The password is incorrect',
        path: [],
      },
    });
  });

  it('should disallow short password', async () => {
    const { user } = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/local', {
      Body: { email: user.email, password: 'sdf' },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      password: {
        code: 'too_small',
        message: 'String must contain at least 8 character(s)',
        path: ['password'],
      },
    });
  });

  it('should disallow using the password of someone else', async () => {
    const user1 = await seedSimpleUser();
    const user2 = await seedSimpleUser();
    const res = await t.fetch.post('/0/auth/local', {
      Body: { email: user1.user.email, password: user2.pwd },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      password: {
        code: 'invalid',
        message: 'The password is incorrect',
        path: [],
      },
    });
  });
});
