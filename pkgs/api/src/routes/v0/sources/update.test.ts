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

describe('PUT /sources/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.put('/0/sources/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.put('/0/sources/bar', {
      token,
      // @ts-expect-error
      Body: { name: '', settings: {} },
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const proj = await seedProject(owner, org);
    const res = await t.fetch.put('/0/sources/bar', {
      token,
      Querystring: { org_id: proj.orgId, project_id: proj.id },
      Body: { name: 'top', settings: getDefaultConfig() },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should update one source', async () => {
    const { token, project } = await seedWithProject();

    // Create
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

    // Update
    const put = await t.fetch.put(`/0/sources/${res.json.data.id}`, {
      token,
      Querystring: { org_id: project.orgId, project_id: project.id },
      Body: { name: 'top', settings: getDefaultConfig() },
    });

    isSuccess(put.json);
    expect(put.statusCode).toBe(200);
  });
});
