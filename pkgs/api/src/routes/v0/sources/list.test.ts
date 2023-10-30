import { getDefaultConfig } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
import {
  seedSimpleUser,
  seedWithOrgViewer,
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

describe('GET /sources', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/sources');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/sources', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const proj = await seedProject(owner, org);
    const res = await t.fetch.get('/0/sources', {
      token,
      Querystring: { org_id: proj.orgId, project_id: proj.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should list sources', async () => {
    const { token, project } = await seedWithProject();
    // create
    const res = await t.fetch.post('/0/sources', {
      token,
      Body: {
        orgId: project.orgId,
        projectId: project.id,
        type: 'github',
        identifier: 'specfy/specfy',
        settings: getDefaultConfig(),
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    // List
    const list = await t.fetch.get(`/0/sources`, {
      token,
      Querystring: { org_id: project.orgId, project_id: project.id },
    });
    isSuccess(list.json);
    expect(list.statusCode).toBe(200);
    expect(list.json.data).toStrictEqual([
      {
        createdAt: expect.toBeIsoDate(),
        id: res.json.data.id,
        identifier: 'specfy/specfy',
        name: 'GitHub specfy/specfy',
        orgId: project.orgId,
        projectId: project.id,
        enable: true,
        settings: {
          branch: 'main',
          documentation: { enabled: true, path: '/' },
          stack: { enabled: true, path: '/' },
          git: { enabled: true },
        },
        type: 'github',
        updatedAt: expect.toBeIsoDate(),
      },
    ]);
  });
});
