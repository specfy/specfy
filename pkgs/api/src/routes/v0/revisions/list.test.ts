import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import buildApp from '../../../app';
import { ApiClient, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

let app: FastifyInstance | undefined;
let client: ApiClient;

beforeAll(async () => {
  app = fastify();
  await buildApp(app, {});
  await app.listen();

  client = new ApiClient((app.server.address() as any)?.port);
});

afterAll(async () => {
  await app?.close();
  if (client) {
    await client.close();
  }
});

describe('GET /revisions', () => {
  it('should be protected', async () => {
    await shouldBeProtected(client, '/0/revisions', 'GET');
  });

  it('should enforce query params', async () => {
    await shouldEnforceQueryParams(client, '/0/revisions', 'GET');
  });

  it('should fail on unknown org/project', async () => {
    const { token } = await seedSimpleUser();
    const res = await client.get('/0/revisions', {
      token,
      qp: {
        org_id: 'e',
        project_id: 'a',
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      org_id: {
        code: 'forbidden',
        message:
          "The organization doesn't exists or you don't have the permissions",
        path: ['org_id'],
      },
      project_id: {
        code: 'forbidden',
        message: "The project doesn't exists or you don't have the permissions",
        path: ['project_id'],
      },
    });
  });
});
