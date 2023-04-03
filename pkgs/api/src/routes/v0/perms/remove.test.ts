import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import { prisma } from '../../../db';
import type { TestSetup } from '../../../test/each';
import { setupAfterAll, setupBeforeAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
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

describe('DELETE /perms', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/perms');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/perms', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should delete own perm', async () => {
    const { token, user, org } = await seedWithOrg();
    const res = await t.fetch.delete('/0/perms', {
      token,
      body: {
        org_id: org.id,
        userId: user.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // We delete our own permissions so everything else will fail
    const resGet = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });
    isValidationError(resGet.json);
  });

  it('should delete someone else perm', async () => {
    const user1 = await seedSimpleUser();
    const { token, org } = await seedWithOrg();

    // Insert a permissions for the simple user
    await prisma.perms.create({
      data: {
        id: nanoid(),
        role: 'viewer',
        userId: user1.user.id,
        orgId: org.id,
      },
    });

    // GET to check that we have two permissions
    const resGet1 = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });
    isSuccess(resGet1.json);
    expect(resGet1.json.data).toHaveLength(2);

    // Delete simple user permissions
    const res = await t.fetch.delete('/0/perms', {
      token,
      body: {
        org_id: org.id,
        userId: user1.user.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // GET to check that we have one permissions (our own)
    const resGet2 = await t.fetch.get('/0/perms', {
      token,
      qp: {
        org_id: org.id,
      },
    });
    isSuccess(resGet2.json);
    expect(resGet2.json.data).toHaveLength(1);
  });
});
