import { describe, beforeAll, it, afterAll, expect } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';

import buildApp from '../../../app';
import {
  ApiClient,
  isError,
  isValidationError,
} from '../../../common/test/helpers';

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
  it('should enforce query params', async () => {
    const res = await client.get('/0/revisions');

    expect(res.statusCode).toBe(400);
    isError(res.json);
  });

  it('should fail on unknown org/project', async () => {
    const res = await client.get('/0/revisions', {
      org_id: 'e',
      project_id: 'a',
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      org_id: {
        code: 'forbidden',
        expected: null,
        message:
          "The organization doesn't exists or you don't have the permissions",
        path: ['org_id'],
      },
      project_id: {
        code: 'forbidden',
        expected: null,
        message: "The project doesn't exists or you don't have the permissions",
        path: ['project_id'],
      },
    });
  });
});
