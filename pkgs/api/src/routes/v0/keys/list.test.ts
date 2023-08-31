import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
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

describe('GET /keys', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/keys');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/keys', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const res = await t.fetch.get('/0/keys', {
      token,
      Querystring: { org_id: project.orgId, project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should fail on wrong org', async () => {
    const { token } = await seedWithOrg();
    const res = await t.fetch.get('/0/keys', {
      token,
      Querystring: { org_id: 'ereoireor', project_id: 'djfhsdjfhskjfhsd' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should fail on wrong project', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/keys', {
      token,
      Querystring: { org_id: org.id, project_id: 'djfhsdjfhskjfhsd' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should list one key for a project', async () => {
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get('/0/keys', {
      token,
      Querystring: { org_id: project.orgId, project_id: project.id },
    });
    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        key: expect.any(String),
        createdAt: expect.toBeIsoDate(),
      },
    ]);
    expect(res.json.data[0].key.startsWith('spfy_')).toBe(true);
  });
});
