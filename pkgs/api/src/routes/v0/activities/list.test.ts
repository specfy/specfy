import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithProject,
} from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /activities', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/activities');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/activities', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list', async () => {
    const { token, user, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/activities', {
      token,
      qp: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        action: 'Key.created',
        activityGroupId: expect.any(String),
        createdAt: expect.toBeIsoDate(),
        id: expect.any(String),
        orgId: org.id,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      },
      {
        action: 'Org.created',
        activityGroupId: expect.any(String),
        createdAt: expect.toBeIsoDate(),
        id: expect.any(String),
        orgId: org.id,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      },
    ]);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithOrg();

    // Seed a second time
    const { token } = await seedWithOrg();
    const res = await t.fetch.get('/0/activities', {
      token,
      qp: { org_id: seed1.org.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('org_id');
  });

  it('should filter project', async () => {
    const { user, token, org, project } = await seedWithProject();
    const res = await t.fetch.get('/0/activities', {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        action: 'Key.created',
        activityGroupId: expect.any(String),
        createdAt: expect.toBeIsoDate(),
        id: expect.any(String),
        orgId: org.id,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
        },
      },
      {
        action: 'Project.created',
        activityGroupId: expect.any(String),
        createdAt: expect.toBeIsoDate(),
        id: expect.any(String),
        orgId: org.id,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
        },
      },
    ]);
  });
});
