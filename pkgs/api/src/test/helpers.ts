import { expect } from 'vitest';

import type { API, APIPaths } from '../types/api/endpoints';

import { isError, isValidationError } from './fetch';
import type { ApiClient } from './fetch';
import { seedSimpleUser } from './seed/seed';

export async function shouldBeProtected<TPath extends APIPaths>(
  client: ApiClient,
  path: TPath,
  method: keyof API[TPath]
) {
  const res = await client[(method as string).toLowerCase()](path as any);

  isError(res.json);
  expect(res.json).toStrictEqual({
    error: {
      code: '401_unauthorized',
    },
  });
  expect(res.statusCode).toBe(401);
}

export async function shouldBeForbidden<TPath extends APIPaths>(
  client: ApiClient,
  path: TPath,
  method: keyof API[TPath]
) {
  const { token } = await seedSimpleUser();
  const res = await client[(method as string).toLowerCase()](path as any, {
    token,
    qp: { random: 'world' } as any,
  });

  isError(res.json);
  expect(res.json).toStrictEqual({
    error: {
      code: '403_forbidden',
    },
  });
  expect(res.statusCode).toBe(403);
}

export async function shouldNotAllowQueryParams<TPath extends APIPaths>(
  client: ApiClient,
  path: TPath,
  method: keyof API[TPath]
) {
  const { token } = await seedSimpleUser();
  const res = await client[(method as string).toLowerCase()](path as any, {
    token,
    qp: { random: 'world' } as any,
  });

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
export async function shouldEnforceQueryParams<TPath extends APIPaths>(
  client: ApiClient,
  path: TPath,
  method: keyof API[TPath]
) {
  const { token } = await seedSimpleUser();
  const res: Awaited<ReturnType<ApiClient['get']>> = await client[
    (method as string).toLowerCase()
  ](path as any, {
    token,
    qp: {},
  });

  isValidationError(res.json);
  expect(res.json.error.form).toStrictEqual([]);
  expect(Object.keys(res.json.error.fields).length).toBeGreaterThan(0);
  expect(res.statusCode).toBe(400);
}
