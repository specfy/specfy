import { nanoid } from '@specfy/core';
import { getDefaultConfig } from '@specfy/models';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
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

describe('POST /sources', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/sources');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/sources', {
      token,
      // @ts-expect-error
      Body: { name: '', orgId: '' },
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/sources', 'POST');
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const proj = await seedProject(owner, org);
    const res = await t.fetch.post('/0/sources', {
      token,
      Body: {
        orgId: org.id,
        projectId: proj.id,
        type: 'github',
        identifier: 'specfy/specfy',
        settings: getDefaultConfig(),
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should create one source', async () => {
    const { token, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/sources', {
      token,
      Body: {
        orgId: project.orgId,
        projectId: project.id,
        name,
        type: 'github',
        identifier: 'specfy/specfy',
        settings: getDefaultConfig(),
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: { id: expect.any(String) },
    });
  });
});
