import { nanoid } from '@specfy/core';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('PUT /orgs/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/orgs/foobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/orgs/foobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should rename', async () => {
    const { token, org } = await seedWithOrg();

    const name = `New Name ${nanoid()}`;
    const res = await t.fetch.put(`/0/orgs/${org.id}`, {
      token,
      Body: {
        name,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data.name).toStrictEqual(name);
  });

  it('should forbid other changes', async () => {
    const { token, org } = await seedWithOrg();

    const res = await t.fetch.put(`/0/orgs/${org.id}`, {
      token,
      Body: {
        // @ts-expect-error
        id: 'dfdfdfsdfsfdsf',
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
