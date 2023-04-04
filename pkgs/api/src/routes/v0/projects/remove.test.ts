import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('DELETE /projects/:org_id/:project_slug', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/projects/foo/bar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/projects/foo/bar', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/projects/foo/bar', {
      token,
      // @ts-expect-error
      body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it.only('should delete a project', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.delete(`/0/projects/${org.id}/${project.slug}`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);
  });
});
