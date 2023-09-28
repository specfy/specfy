import { getDefaultConfig } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowBody,
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

describe('DELETE /sources/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/sources/jdkfdf');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/sources/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/sources/bar', {
      token,
      // @ts-expect-error
      Body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const proj = await seedProject(owner, org);
    const res = await t.fetch.delete('/0/sources/dfdf', {
      token,
      Querystring: { org_id: proj.orgId, project_id: proj.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should delete one source', async () => {
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

    // delete
    const del = await t.fetch.delete(`/0/sources/${res.json.data.id}`, {
      token,
      Querystring: { org_id: project.orgId, project_id: project.id },
    });
    isSuccess(del.json);
    expect(del.statusCode).toBe(204);
  });
});
