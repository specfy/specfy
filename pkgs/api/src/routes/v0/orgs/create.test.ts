import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { prisma } from '../../../db';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { createOrgId } from '../../../test/seed/orgs';
import { seedSimpleUser } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
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
      body: { id: id, name: `test ${id}` },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: id,
      name: `test ${id}`,
      isPersonal: false,
      avatarUrl: null,
      acronym: 'TE',
      color: expect.any(String),
    });

    // Should also create a permission
    const hasPerms = await prisma.perms.count({
      where: { orgId: res.json.id },
    });
    expect(hasPerms).toBe(1);
  });

  it('should reject already used id', async () => {
    const { token } = await seedSimpleUser();
    const id = createOrgId();

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
