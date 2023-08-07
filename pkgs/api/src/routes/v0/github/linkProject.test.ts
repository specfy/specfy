import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject } from '../../../test/seed/projects.js';
import { seedSimpleUser, seedWithOrgViewer } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /github/link_project', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/github/link_project');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/github/link_project', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const proj = await seedProject(owner, org);
    const res = await t.fetch.post(`/0/github/link_project`, {
      token,
      Body: { orgId: org.id, projectId: proj.id, repository: 'specfy/specfy' },
    });

    expect(res.statusCode).toBe(403);
  });
});
