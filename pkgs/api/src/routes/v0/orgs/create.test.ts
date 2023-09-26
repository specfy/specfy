import { prisma } from '@specfy/db';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { createOrgId } from '../../../test/seed/orgs.js';
import { seedSimpleUser } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /orgs', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/orgs');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/orgs', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/orgs', 'POST');
  });

  it('should create one org', async () => {
    const { token } = await seedSimpleUser();
    const id = createOrgId();
    const res = await t.fetch.post('/0/orgs', {
      token,
      Body: { id, name: `test ${id}` },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: {
        id,
        name: `test ${id}`,
        avatarUrl: null,
        acronym: 'TE',
        color: expect.any(String),
      },
    });

    // Should also create a permission
    const hasPerms = await prisma.perms.count({
      where: { orgId: res.json.data.id },
    });
    expect(hasPerms).toBe(1);
  });

  it('should reject already used id', async () => {
    const { token } = await seedSimpleUser();
    const id = createOrgId();

    // Insert one
    const res1 = await t.fetch.post('/0/orgs', {
      token,
      Body: { id, name: `test ${id}` },
    });
    isSuccess(res1.json);

    // Insert the same
    const res2 = await t.fetch.post('/0/orgs', {
      token,
      Body: { id, name: `test ${id}` },
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

  it('should reject invalid name', async () => {
    const { token } = await seedSimpleUser();

    // Insert one
    const res = await t.fetch.post('/0/orgs', {
      token,
      Body: { id: `admin`, name: `Admin` },
    });
    isValidationError(res.json);

    expect(res.json.error.fields).toStrictEqual({
      id: {
        code: 'invalid',
        message: 'This id is not allowed',
        path: ['id'],
      },
    });
  });
});
