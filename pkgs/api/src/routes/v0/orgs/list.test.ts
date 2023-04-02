import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import buildApp from '../../../app';
import { ApiClient, isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed';

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
  await client.close();
});

describe('GET /orgs', () => {
  it('should be protected', async () => {
    await shouldBeProtected(client, '/0/orgs', 'GET');
  });

  it('should not allow query params', async () => {
    await shouldNotAllowQueryParams(client, '/0/orgs', 'GET');
  });

  it('should return no orgs', async () => {
    const { token } = await seedSimpleUser();
    const res = await client.get('/0/orgs', { token });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    res.json.data;
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await client.get('/0/orgs', {
      token,
      // @ts-expect-error
      qp: { search: ' ' },
    });

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
    const { token, org } = await seedWithOrg();
    const res = await client.get('/0/orgs', { token });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data).toStrictEqual([
      {
        id: org.id,
        name: org.name,
      },
    ]);
  });

  it('should not list the other orgs', async () => {
    const seed1 = await seedWithOrg();
    const seed2 = await seedWithOrg();
    const res1 = await client.get('/0/orgs', { token: seed1.token });

    isSuccess(res1.json);
    expect(res1.statusCode).toBe(200);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data).toStrictEqual([
      {
        id: seed1.org.id,
        name: seed1.org.name,
      },
    ]);

    const res2 = await client.get('/0/orgs', { token: seed2.token });
    isSuccess(res2.json);
    expect(res2.statusCode).toBe(200);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data).toStrictEqual([
      {
        id: seed2.org.id,
        name: seed2.org.name,
      },
    ]);
  });
});
