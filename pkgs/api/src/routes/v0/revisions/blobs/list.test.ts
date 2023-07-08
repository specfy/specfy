import { beforeAll, afterAll, expect, describe, it } from 'vitest';

import type { TestSetup } from '../../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../../test/each.js';
import { isSuccess } from '../../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../../test/helpers.js';
import {
  getBlobComponent,
  seedComponent,
} from '../../../../test/seed/components.js';
import { seedRevision } from '../../../../test/seed/revisions.js';
import { seedSimpleUser, seedWithProject } from '../../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions/:revision_id/blobs', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/revisions/foo/blobs');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions/foo/blobs', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should list no blobs', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Get blobs
    const res = await t.fetch.get(`/0/revisions/${revision.id}/blobs`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual([]);
  });

  it('should list one blob', async () => {
    const { token, org, project, user } = await seedWithProject();

    const blob = getBlobComponent(org, project);
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: null,
        type: 'component',
        typeId: blob.id,
        created: true,
        deleted: false,
        current: blob,
      },
    ]);

    // Get blobs
    const res = await t.fetch.get(`/0/revisions/${revision.id}/blobs`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual([
      {
        id: revision.blobs[0],
        parentId: null,
        type: 'component',
        typeId: blob.id,
        created: true,
        deleted: false,
        previous: null,
        current: expect.objectContaining({ id: blob.id }),
        createdAt: expect.toBeIsoDate(),
        updatedAt: expect.toBeIsoDate(),
      },
    ]);
  });

  it('should list one blob with previous', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    // Modifies it in a revision
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: component.blobId,
        type: 'component',
        typeId: blob.id,
        created: true,
        deleted: false,
        current: blob,
      },
    ]);

    // Get blobs
    const res = await t.fetch.get(`/0/revisions/${revision.id}/blobs`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual([
      {
        id: revision.blobs[0],
        parentId: component.blobId,
        type: 'component',
        typeId: blob.id,
        created: true,
        deleted: false,
        previous: expect.objectContaining({ id: blob.id }),
        current: expect.objectContaining({ id: blob.id }),
        createdAt: expect.toBeIsoDate(),
        updatedAt: expect.toBeIsoDate(),
      },
    ]);
  });
});
