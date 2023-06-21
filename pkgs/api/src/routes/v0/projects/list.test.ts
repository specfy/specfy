import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
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

describe('GET /projects', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/projects');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/projects', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list', async () => {
    const { token, org, project } = await seedWithProject();
    const res = await t.fetch.get('/0/projects', {
      token,
      Querystring: { org_id: org.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        id: project.id,
        name: project.name,
        orgId: project.orgId,
        slug: project.slug,
        blobId: expect.any(String),
        description: { content: [], type: 'doc' },
        display: {
          zIndex: 1,
          size: { height: 32, width: 100 },
          pos: { x: 20, y: 10 },
        },
        createdAt: expect.toBeIsoDate(),
        updatedAt: expect.toBeIsoDate(),
        edges: [],
        links: [],
      },
    ]);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithOrg();

    // Seed a second time
    const { token } = await seedWithOrg();
    const res = await t.fetch.get('/0/projects', {
      token,
      Querystring: { org_id: seed1.org.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('org_id');
  });
});
