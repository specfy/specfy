import { prisma } from '@specfy/db';
import {
  createComponentBlob,
  flagRevisionApprovalEnabled,
} from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils.js';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { Orgs, Projects, Users } from '@specfy/db';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
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

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

async function revisionWithBlob(user: Users, org: Orgs, project: Projects) {
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

  return { revision, component, blob };
}

describe('POST /revisions/:revision_id/merge', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions/foo/merge');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/revisions/foo/merge', {
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
    const { token, org, owner, ownerToken } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const revision = await seedRevision(owner, org, project);

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token: ownerToken,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should merge', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a revision
    const { revision, component } = await revisionWithBlob(user, org, project);

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);

    // Get new component
    const list = await t.fetch.get(`/0/components`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(list.json);
    expect(list.json.data).toHaveLength(1);
    expect(list.json.data[0].id).toBe(component.id);
  });

  it('should not merge an empty revision', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'empty',
    });
  });

  it.skipIf(!flagRevisionApprovalEnabled)(
    'should not merge a non ready revision',
    async () => {
      const { token, org, project, user } = await seedWithProject();
      const revision = await seedRevision(user, org, project);

      // Merge
      const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
        token,
        Querystring: { org_id: org.id, project_id: project.id },
      });
      isError(res.json);
      expect(res.statusCode).toBe(400);
      expect(res.json.error).toStrictEqual({
        code: 'cant_merge',
        reason: 'no_reviews',
      });
    }
  );

  it('should not merge an approved outdated revision', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a revision
    const { revision, component } = await revisionWithBlob(user, org, project);

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

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'outdated',
    });
  });

  it('should not merge an already merged revision', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a revision
    const { revision } = await revisionWithBlob(user, org, project);

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);

    // Merge Again
    const res2 = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
    });
    isError(res2.json);
    expect(res2.statusCode).toBe(400);
    expect(res2.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'already_merged',
    });
  });
});
