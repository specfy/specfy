import { expect } from '@jest/globals';

import { isError } from './fetch';
import type { ApiClient } from './fetch';
import { seedSimpleUser } from './seed/seed';

export async function shouldBeProtected(request: ReturnType<ApiClient['get']>) {
  const res = await request;

  isError(res.json);
  expect(res.statusCode).toBe(401);
  expect(res.json).toStrictEqual({
    error: {
      code: '401_unauthorized',
    },
  });
}

export async function shouldBeForbidden(
  cb: (token: string) => ReturnType<ApiClient['get']>
) {
  const { token } = await seedSimpleUser();
  const res = await cb(token);

  isError(res.json);
  expect(res.statusCode).toBe(403);
  expect(res.json).toStrictEqual({
    error: {
      code: '403_forbidden',
    },
  });
}
