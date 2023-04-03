import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions', () => {
  it('should be protected', async () => {
    await shouldBeProtected(t.fetch, '/0/revisions', 'GET');
  });

  it('should enforce query params', async () => {
    await shouldEnforceQueryParams(t.fetch, '/0/revisions', 'GET');
  });

  it('should fail on unknown org/project', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions', {
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
