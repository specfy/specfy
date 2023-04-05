import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { prisma } from '../../../db';
import { createComponentBlob } from '../../../models/component';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { getBlobComponent, seedComponent } from '../../../test/seed/components';
import { seedRevision } from '../../../test/seed/revisions';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';
import type {
  ApiBlobWithPrevious,
  ResListRevisionBlobs,
} from '../../../types/api';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /revisions/:revision_id/rebase', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions/foo/rebase');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/revisions/foo/rebase', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should rebase nothing', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({ done: true });
  });

  it('should reset approval and status', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Approve
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);

    // Rebase
    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    // Get
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.status).toBe('waiting');
  });

  it('should rebase outdated blobs', async () => {
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
        blob,
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

    // Rebase
    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    // Get
    const get = await t.fetch.get(`/0/revisions/${revision.id}/blobs`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    const data = get.json.data as unknown as ApiBlobWithPrevious[];
    expect(data[0].id).toBe(revision.blobs![0]);
    expect(data[0].typeId).toBe(blob.id);
    expect(data[0].parentId).toBe(newBlob.id);
  });
});
