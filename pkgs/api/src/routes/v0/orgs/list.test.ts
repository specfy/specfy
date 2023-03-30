import { describe, beforeAll, it, afterAll, expect } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';

import buildApp from '../../../app';
import { db } from '../../../db';
import { ApiClient, isSuccess, isValidationError } from '../../../test/helpers';

let app: FastifyInstance;
let client: ApiClient;

beforeAll(async () => {
  app = fastify();
  await buildApp(app, {});
  await app.listen();

  client = new ApiClient((app.server.address() as any)?.port);
});

afterAll(async () => {
  await app.close();
  client.close();
  await db.close();
});

describe('GET /orgs', () => {
  it('should return no orgs', async () => {
    const res = await client.get('/0/orgs');

    expect(res.statusCode).toBe(200);
    isSuccess(res.json);

    res.json.data;
  });

  it('should not allow query params', async () => {
    const res = await client.get(
      '/0/orgs',
      // @ts-expect-error
      { search: ' ' }
    );

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.form).toStrictEqual([
      {
        code: 'unrecognized_keys',
        message: "Unrecognized key(s) in object: 'search'",
        path: [],
      },
    ]);
  });

  it('should list one org', async () => {
    const res = await client.get('/0/orgs');

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
  });
});
