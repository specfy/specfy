import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import type { TestSetup } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedComponent } from '../../../test/seed/components.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /components', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/components');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/components', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list', async () => {
    const { token, user, org, project } = await seedWithProject();
    const component = await seedComponent(user, org, project);
    const res = await t.fetch.get('/0/components', {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.json.data).toStrictEqual([
      {
        id: expect.any(String),
        orgId: org.id,
        projectId: project.id,
        name: component.name,
        slug: component.slug,
        inComponent: null,
        techs: [],
        techId: null,
        type: 'service',
        typeId: null,
        blobId: expect.any(String),
        description: { content: [], type: 'doc' },
        display: {
          size: { height: 32, width: 100 },
          pos: { x: 20, y: 10 },
          zIndex: 1,
        },
        edges: [],
        show: true,
        tags: [],
        source: null,
        sourceName: null,
        sourcePath: null,
        updatedAt: expect.toBeIsoDate(),
        createdAt: expect.toBeIsoDate(),
      },
    ]);
  });

  it('should disallow other org', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token, project } = await seedWithProject();
    const res = await t.fetch.get('/0/components', {
      token,
      Querystring: { org_id: seed1.org.id, project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.form).toStrictEqual([
      {
        code: 'forbidden',
        message:
          "Targeted resource doesn't exists or you don't have the permissions",
        path: [],
      },
    ]);
  });

  it('should disallow other project', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get('/0/components', {
      token,
      Querystring: { org_id: org.id, project_id: seed1.project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.form).toStrictEqual([
      {
        code: 'forbidden',
        message:
          "Targeted resource doesn't exists or you don't have the permissions",
        path: [],
      },
    ]);
  });

  it('should inherit permissions', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token } = await seedSimpleUser(seed1.org);
    const res = await t.fetch.get('/0/components', {
      token,
      Querystring: { org_id: seed1.org.id, project_id: seed1.project.id },
    });

    isSuccess(res.json);
  });
});
