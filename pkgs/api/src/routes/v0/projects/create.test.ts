import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import { slugify } from '../../../common/string';
import { prisma } from '../../../db';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

const display = { zIndex: 1, pos: { x: 0, y: 0, width: 50, height: 32 } };
describe('POST /projects', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/projects');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/projects', {
      token,
      body: { name: '', display, orgId: '', slug: '' },
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/projects', 'POST');
  });

  it('should create one project', async () => {
    const { token, org } = await seedWithOrg();
    const name = `test ${nanoid()}`;
    const slug = slugify(name);
    const res = await t.fetch.post('/0/projects', {
      token,
      body: { name, slug, display, orgId: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
      slug: slug,
    });

    // Should also create a permission
    const hasPerms = await prisma.perms.count({
      where: { orgId: org.id, projectId: res.json.id },
    });
    expect(hasPerms).toBe(1);
  });

  it('should reject already used slug', async () => {
    const { token, org } = await seedWithOrg();
    const name = `test ${nanoid()}`;

    // Insert one
    const res1 = await t.fetch.post('/0/projects', {
      token,
      body: { name, slug: slugify(name), display, orgId: org.id },
    });
    isSuccess(res1.json);

    // Insert the same
    const res2 = await t.fetch.post('/0/projects', {
      token,
      body: { name, slug: slugify(name), display, orgId: org.id },
    });
    isValidationError(res2.json);
    expect(res2.json.error.fields).toStrictEqual({
      slug: {
        code: 'exists',
        message: 'This slug is already used',
        path: ['slug'],
      },
    });
  });
});