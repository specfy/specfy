import { prisma } from '@specfy/db';
import { createComponentBlob } from '@specfy/models';
import type { ApiBlobWithPrevious } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils.js';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedComponent } from '../../../test/seed/components.js';
import { seedProject } from '../../../test/seed/projects.js';
import { seedRevision } from '../../../test/seed/revisions.js';
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
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      // @ts-expect-error
      Body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const revision = await seedRevision(owner, org, project);

    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should rebase nothing', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
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
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);

    // Rebase
    const res = await t.fetch.post(`/0/revisions/${revision.id}/rebase`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    // Get
    const get = await t.fetch.get(`/0/revisions/${revision.id}`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    expect(get.json.data.status).toBe('waiting');
  });

  it('should rebase outdated blobs', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(project), id: component.id };

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
    const blob2 = { ...getBlobComponent(project), id: component.id };
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
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);
    expect(res.statusCode).toBe(200);

    // Get
    const get = await t.fetch.get(`/0/revisions/${revision.id}/blobs`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(get.json);
    const data = get.json.data as unknown as ApiBlobWithPrevious[];
    expect(data[0].id).toBe(revision.blobs[0]);
    expect(data[0].typeId).toBe(blob.id);
    expect(data[0].parentId).toBe(newBlob.id);
  });
});
