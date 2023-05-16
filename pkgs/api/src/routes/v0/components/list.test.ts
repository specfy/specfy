import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedComponent } from '../../../test/seed/components';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list', async () => {
    const { token, user, org, project } = await seedWithProject();
    const component = await seedComponent(user, org, project);
    const res = await t.fetch.get('/0/components', {
      token,
      qp: { org_id: org.id, project_id: project.id },
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
        tech: [],
        techId: null,
        type: 'component',
        typeId: null,
        updatedAt: expect.toBeIsoDate(),
        blobId: expect.any(String),
        createdAt: expect.toBeIsoDate(),
        description: { content: [], type: 'doc' },
        display: {
          size: { height: 32, width: 100 },
          pos: { x: 20, y: 10 },
          zIndex: 1,
        },
        edges: [],
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
      qp: { org_id: seed1.org.id, project_id: project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('org_id');
  });

  it('should disallow other project', async () => {
    // Seed once
    const seed1 = await seedWithProject();

    // Seed a second time
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get('/0/components', {
      token,
      qp: { org_id: org.id, project_id: seed1.project.id },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toHaveProperty('project_id');
  });
});
