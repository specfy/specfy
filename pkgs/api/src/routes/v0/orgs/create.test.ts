import { customAlphabet } from 'nanoid/non-secure';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser } from '../../../test/seed/seed';

const orgId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 20);

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /orgs', () => {
  it('should be protected', async () => {
    await shouldBeProtected(t.fetch, '/0/orgs', 'POST');
  });

  it('should not allow query params', async () => {
    await shouldNotAllowQueryParams(t.fetch, '/0/orgs', 'POST', true);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/orgs', 'POST');
  });

  it('should create one org', async () => {
    const { token } = await seedSimpleUser();
    const id = orgId();
    const res = await t.fetch.post('/0/orgs', {
      token,
      body: { id: id, name: `test ${id}` },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({ id: id, name: `test ${id}` });
  });

  it('should reject already used id', async () => {
    const { token } = await seedSimpleUser();
    const id = orgId();

    // Insert one
    const res1 = await t.fetch.post('/0/orgs', {
      token,
      body: { id: id, name: `test ${id}` },
    });
    isSuccess(res1.json);

    // Insert the same
    const res2 = await t.fetch.post('/0/orgs', {
      token,
      body: { id: id, name: `test ${id}` },
    });
    isValidationError(res2.json);
    expect(res2.json.error.fields).toStrictEqual({
      id: {
        code: 'exists',
        message: 'This id is already used',
        path: ['id'],
      },
    });
  });
});
