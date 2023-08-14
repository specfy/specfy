import { prisma } from '@specfy/db';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { createComponentBlob } from '../../../models/index.js';
import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import {
  getBlobComponent,
  seedComponent,
} from '../../../test/seed/components.js';
import { seedRevision } from '../../../test/seed/revisions.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions/:revision_id/checks', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/revisions/foo/checks');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/revisions/foo/checks', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get default checks', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: [],
      reviews: [],
    });
  });

  it('should get mergeable checks', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: true,
      outdatedBlobs: [],
      reviews: [
        {
          commentId: comment.json.data.id,
          id: expect.any(String),
          user: {
            avatarUrl: null,
            email: user.email,
            id: user.id,
            name: user.name,
          },
        },
      ],
    });
  });

  it('should get checks with non-approved comment', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: false, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);

    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: [],
      reviews: [],
    });
  });

  it('should get checks with outdated blobs', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    // Modifies it in a revision
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: component.blobId,
        type: 'component',
        typeId: component.id,
        created: false,
        deleted: false,
        current: blob,
      },
    ]);

    // Modifies the component in the main channel
    const blob2 = { ...getBlobComponent(org, project), id: component.id };
    const newBlob = await createComponentBlob({
      blob: blob2 as any,
      tx: prisma,
    });
    await prisma.components.update({
      data: { ...(blob2 as any), blobId: newBlob.id },
      where: { id: component.id },
    });

    // Checks
    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: revision.blobs,
      reviews: [],
    });
  });

  it('should get checks with deleted blobs', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    // Modifies it in a revision
    const revision = await seedRevision(user, org, project, undefined, [
      {
        parentId: component.blobId,
        type: 'component',
        typeId: component.id,
        created: false,
        deleted: false,
        current: blob,
      },
    ]);

    // Delete the component in the main channel
    const blob2 = { ...getBlobComponent(org, project), id: component.id };
    await createComponentBlob({
      blob: blob2 as any,
      data: { deleted: true },
      tx: prisma,
    });
    await prisma.components.delete({
      where: { id: component.id },
    });

    // Checks
    const res = await t.fetch.get(`/0/revisions/${revision.id}/checks`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      canMerge: false,
      outdatedBlobs: revision.blobs,
      reviews: [],
    });
  });
});
