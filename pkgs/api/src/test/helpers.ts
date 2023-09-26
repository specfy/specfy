import { expect } from 'vitest';

import { isError, isValidationError } from './fetch.js';
import { seedSimpleUser } from './seed/seed.js';

import type { ApiClient } from './fetch.js';
import type { API, APIPaths } from '../types/api/endpoints.js';
import type { Dispatcher } from 'undici';

export async function shouldBeProtected(
  res: Dispatcher.ResponseData & { json: any }
) {
  isError(res.json);
  expect(res.json).toStrictEqual({
    error: {
      code: '401_unauthorized',
    },
  });
  expect(res.statusCode).toBe(401);
}

export async function shouldNotAllowQueryParams(
  res: Dispatcher.ResponseData & { json: any }
) {
  isValidationError(res.json);
  expect(res.json.error.form).toStrictEqual([
    {
      code: 'unrecognized_keys',
      message: "Unrecognized key(s) in object: 'random'",
      path: [],
    },
  ]);
  expect(res.statusCode).toBe(400);
}

export function shouldBeNotFound(res: Dispatcher.ResponseData & { json: any }) {
  isError(res.json);
  expect(res.json).toStrictEqual({
    error: {
      code: '404_not_found',
    },
  });
  expect(res.statusCode).toBe(404);
}

export async function shouldNotAllowBody(
  res: Dispatcher.ResponseData & { json: any }
) {
  isValidationError(res.json);
  expect(res.json.error.form).toStrictEqual([
    {
      code: 'unrecognized_keys',
      message: "Unrecognized key(s) in object: 'random'",
      path: [],
    },
  ]);
  expect(res.statusCode).toBe(400);
}

export async function shouldEnforceBody<TPath extends APIPaths>(
  client: ApiClient,
  path: TPath,
  method: keyof API[TPath]
) {
  const { token } = await seedSimpleUser();
  const res = await client[(method as string).toLowerCase() as 'post'](
    path as any,
    {
      token,
      // @ts-expect-error
      Body: { wrong: 'body' },
    }
  );

  isValidationError(res.json);
  expect(res.json.error.form).toStrictEqual([
    {
      code: 'unrecognized_keys',
      message: "Unrecognized key(s) in object: 'wrong'",
      path: [],
    },
  ]);
  expect(Object.keys(res.json.error.fields).length).toBeGreaterThan(0);
  expect(res.statusCode).toBe(400);
}
