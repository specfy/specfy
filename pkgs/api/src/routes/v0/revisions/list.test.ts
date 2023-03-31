import { describe, beforeAll, it, afterAll, expect } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';

import buildApp from '../../../app';
import { ApiClient, isError, isValidationError } from '../../../test/fetch';
import { shouldBeProtected } from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

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

describe('GET /revisions', () => {
  it('should be protected', async () => {
    await shouldBeProtected(client.get('/0/revisions'));
  });

  it('should enforce query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await client.get('/0/revisions', token);

    expect(res.statusCode).toBe(400);
    isError(res.json);
  });

  it('should fail on unknown org/project', async () => {
    const { token } = await seedSimpleUser();
    const res = await client.get('/0/revisions', token, {
      org_id: 'e',
      project_id: 'a',
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
