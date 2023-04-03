import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { slugify } from '../../../common/string';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedComponent } from '../../../test/seed/components';
import { seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /me', () => {
  it('should be protected', async () => {
    await shouldBeProtected(t.fetch, '/0/components', 'GET');
  });

  it('should not allow query params', async () => {
    await shouldNotAllowQueryParams(t.fetch, '/0/components', 'GET');
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
        name: `Component ${component.id}`,
        slug: `component-${slugify(component.id)}`,
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
          pos: { height: 32, width: 100, x: 20, y: 10 },
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
