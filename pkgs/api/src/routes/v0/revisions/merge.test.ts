import type { Orgs, Projects, Users } from '@prisma/client';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { prisma } from '../../../db';
import { createComponentBlob } from '../../../models/component';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isError, isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { getBlobComponent, seedComponent } from '../../../test/seed/components';
import { seedRevision } from '../../../test/seed/revisions';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow body', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      // @ts-expect-error
      body: { random: 'world' },
    });
    await shouldNotAllowBody(res);
  });

  it('should merge', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a revision
    const { revision, component } = await revisionWithBlob(user, org, project);

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);

    // Get new component
    const list = await t.fetch.get(`/0/components`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
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
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'empty',
    });
  });

  it('should not merge a non ready revision', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'no_reviews',
    });
  });

  it('should not merge an approved outdated revision', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a revision
    const { revision, component } = await revisionWithBlob(user, org, project);

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

    // Approved
    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
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
      qp: { org_id: org.id, project_id: project.id },
      body: { approval: true, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment.json);

    // Merge
    const res = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isSuccess(res.json);

    // Merge Again
    const res2 = await t.fetch.post(`/0/revisions/${revision.id}/merge`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });
    isError(res2.json);
    expect(res2.statusCode).toBe(400);
    expect(res2.json.error).toStrictEqual({
      code: 'cant_merge',
      reason: 'already_merged',
    });
  });
});
