import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
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

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('DELETE /projects/:project_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/projects/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/projects/bar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/projects/bar', {
      token,
      // @ts-expect-error
      Body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const res = await t.fetch.delete(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should delete a project', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.delete(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // Check that it's indeed deleted
    const resGet = await t.fetch.get(`/0/projects/${project.id}`, {
      token,
      Querystring: { org_id: org.id },
    });
    isError(resGet.json);
    expect(resGet.statusCode).toBe(403);
  });
});
