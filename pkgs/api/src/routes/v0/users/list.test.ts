import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithProject,
} from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /users', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/users');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/users', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get('/0/users', {
      token,
      Querystring: { org_id: seed1.org.id, project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should list', async () => {
    const { token, user, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/users', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        avatarUrl: null,
        email: user.email,
        id: user.id,
        name: user.name,
      },
    ]);
  });

  it('should not list other orgs', async () => {
    const seed1 = await seedWithOrg();
    const seed2 = await seedWithOrg();

    // GET 1
    const res1 = await t.fetch.get('/0/users', {
      token: seed1.token,
      Querystring: { org_id: seed1.org.id },
    });

    isSuccess(res1.json);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data[0].id).toStrictEqual(seed1.user.id);

    // GET 2
    const res2 = await t.fetch.get('/0/users', {
      token: seed2.token,
      Querystring: { org_id: seed2.org.id },
    });

    isSuccess(res2.json);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data[0].id).toStrictEqual(seed2.user.id);
  });

  it('should filter by name', async () => {
    const { token, org } = await seedWithProject();
    await seedSimpleUser(org);
    const user3 = await seedSimpleUser(org);

    const res = await t.fetch.get('/0/users', {
      token,
      Querystring: {
        org_id: org.id,
        search: user3.user.id.substring(0, 4),
      },
    });

    isSuccess(res.json);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toStrictEqual(user3.user.id);
  });

  it('should filter by project', async () => {
    const seed1 = await seedWithProject();
    const seed2 = await seedWithProject();

    // GET 1
    const res1 = await t.fetch.get('/0/users', {
      token: seed1.token,
      Querystring: {
        org_id: seed1.org.id,
        project_id: seed1.project.id,
      },
    });

    isSuccess(res1.json);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data[0].id).toStrictEqual(seed1.user.id);

    // GET 1
    const res2 = await t.fetch.get('/0/users', {
      token: seed2.token,
      Querystring: {
        org_id: seed2.org.id,
        project_id: seed2.project.id,
      },
    });

    isSuccess(res2.json);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data[0].id).toStrictEqual(seed2.user.id);
  });
});
