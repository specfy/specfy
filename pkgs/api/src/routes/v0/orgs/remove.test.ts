import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { prisma } from '../../../db/index.js';
import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowBody,
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

describe('DELETE /orgs/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/orgs/foobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/orgs/foobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/orgs/foobar', {
      token,
      // @ts-expect-error
      Body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should delete an org', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.delete(`/0/orgs/${org.id}`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // Check that it's indeed deleted
    const resGet = await t.fetch.get(`/0/orgs`, {
      token,
    });
    isSuccess(resGet.json);
    expect(resGet.json.data).toStrictEqual([]);
  });

  it('should delete also projects', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.delete(`/0/orgs/${org.id}`, {
      token,
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(204);

    // Check that it's indeed deleted (we no longer have perm so it would return 400)
    const proj = await prisma.projects.findUnique({
      where: {
        id: project.id,
      },
    });
    expect(proj).toBeNull();
  });

  it('should not delete personal org', async () => {
    const { token, org } = await seedWithOrg();
    await prisma.orgs.update({
      data: {
        isPersonal: true,
      },
      where: {
        id: org.id,
      },
    });

    const res = await t.fetch.delete(`/0/orgs/${org.id}`, {
      token,
    });

    isError(res.json);
    expect(res.statusCode).toBe(400);
  });
});
