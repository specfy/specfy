import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithOrgViewer,
  seedWithProject,
} from '../../../test/seed/seed.js';

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
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, user } = await seedWithOrgViewer();

    // Insert a permissions for the simple user
    await prisma.perms.create({
      data: {
        id: nanoid(),
        role: 'viewer',
        userId: user.id,
        orgId: org.id,
      },
    });

    const res = await t.fetch.delete('/0/perms', {
      token,
      Body: {
        org_id: org.id,
        userId: user.id,
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it('should delete own perm', async () => {
    const { token, user, org } = await seedWithOrg();
    const res = await t.fetch.delete('/0/perms', {
      token,
      Body: {
        org_id: org.id,
        userId: user.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // We delete our own permissions so everything else will fail
    const resGet = await t.fetch.get('/0/perms', {
      token,
      Querystring: {
        org_id: org.id,
      },
    });
    expect(resGet.statusCode).toBe(403);
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
      Querystring: {
        org_id: org.id,
      },
    });
    isSuccess(resGet1.json);
    expect(resGet1.json.data).toHaveLength(2);

    // Delete simple user permissions
    const res = await t.fetch.delete('/0/perms', {
      token,
      Body: {
        org_id: org.id,
        userId: user1.user.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // GET to check that we have one permissions (our own)
    const resGet2 = await t.fetch.get('/0/perms', {
      token,
      Querystring: {
        org_id: org.id,
      },
    });
    isSuccess(resGet2.json);
    expect(resGet2.json.data).toHaveLength(1);
  });

  it('should remove project perm when removing org perm', async () => {
    const { token, org, project } = await seedWithProject();
    const user1 = await seedSimpleUser();

    // Insert a permissions for the simple user
    await prisma.perms.create({
      data: {
        id: nanoid(),
        role: 'viewer',
        userId: user1.user.id,
        orgId: org.id,
      },
    });
    await prisma.perms.create({
      data: {
        id: nanoid(),
        role: 'viewer',
        userId: user1.user.id,
        orgId: org.id,
        projectId: project.id,
      },
    });

    // GET to check that we have permissions for project
    const resGet1 = await t.fetch.get('/0/perms', {
      token,
      Querystring: {
        org_id: org.id,
        project_id: project.id,
      },
    });
    isSuccess(resGet1.json);
    expect(resGet1.json.data).toHaveLength(2);

    // Delete simple user permissions
    const resDel = await t.fetch.delete('/0/perms', {
      token,
      Body: {
        org_id: org.id,
        userId: user1.user.id,
      },
    });

    isSuccess(resDel.json);
    expect(resDel.statusCode).toBe(204);

    // GET to check that we have no permissions
    const resGet2 = await t.fetch.get('/0/perms', {
      token,
      Querystring: {
        org_id: org.id,
        project_id: project.id,
      },
    });
    isSuccess(resGet2.json);
    expect(resGet2.json.data).toHaveLength(1);
  });
});
