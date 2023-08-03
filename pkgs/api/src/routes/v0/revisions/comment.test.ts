import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
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

describe('GET /revisions/:revision_id/comment', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions/foo/comment');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/revisions/foo/comment', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should reject invalid body', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const res = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      // @ts-expect-error
      Body: {},
    });
    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const revision = await seedRevision(owner, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: false, content: { content: [], type: 'doc' } },
    });

    expect(comment.statusCode).toBe(403);
  });

  it('should post a comment', async () => {
    const { token, org, project, user } = await seedWithProject();
    const revision = await seedRevision(user, org, project);

    const comment = await t.fetch.post(`/0/revisions/${revision.id}/comment`, {
      token,
      Querystring: { org_id: org.id, project_id: project.id },
      Body: { approval: false, content: { content: [], type: 'doc' } },
    });
    isSuccess(comment);
  });
});
