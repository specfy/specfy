import { describe, beforeAll, it, afterAll, expect } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';

import buildApp from '../../../app';
import { ApiClient, isError, isSuccess } from '../../../common/test/helpers';

let app: FastifyInstance;
let client: ApiClient;

beforeAll(async () => {
  app = fastify();
  await buildApp(app, {});
  await app.listen();

  client = new ApiClient((app.server.address() as any)?.port);
});

afterAll(() => {
  app.close();
  client.close();
});

describe('GET /orgs', () => {
  it('should return no orgs', async () => {
    const res = await client.get('/0/orgs');

    expect(res.statusCode).toBe(200);
    isSuccess(res.json);

    res.json.data;
  });

  it('should return not allow query params', async () => {
    const res = await client.get(
      '/0/orgs',
      // @ts-expect-error
      { search: ' ' }
    );

    isError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
