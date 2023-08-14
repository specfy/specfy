import { nanoid } from '@specfy/core';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithOrgViewer,
} from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('DELETE /invitations/:id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.delete('/0/invitations/foobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.delete('/0/invitations/foobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org, ownerToken } = await seedWithOrgViewer();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token: ownerToken,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Delete
    const del = await t.fetch.delete(`/0/invitations/${post.json.data.id}`, {
      token,
    });
    expect(del.statusCode).toBe(403);
  });

  it('should delete one invitation', async () => {
    const { token, org } = await seedWithOrg();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // List
    const get = await t.fetch.get('/0/invitations', {
      token,
      Querystring: { org_id: org.id },
    });
    isSuccess(get.json);
    expect(get.statusCode).toBe(200);
    expect(get.json.data).toHaveLength(1);

    // Delete
    const del = await t.fetch.delete(`/0/invitations/${post.json.data.id}`, {
      token,
    });
    isSuccess(del.json);
    expect(del.statusCode).toBe(204);

    // List again
    const get2 = await t.fetch.get('/0/invitations', {
      token,
      Querystring: { org_id: org.id },
    });
    isSuccess(get2.json);
    expect(get2.statusCode).toBe(200);
    expect(get2.json.data).toHaveLength(0);
  });

  it('should reject not found invitations', async () => {
    const { token } = await seedWithOrg();
    const fakeid = nanoid();
    const res = await t.fetch.delete(`/0/invitations/${fakeid}`, {
      token,
    });

    isError(res.json);
    expect(res.statusCode).toBe(404);
  });

  it('should reject deleting an other org invitation', async () => {
    const { token, org } = await seedWithOrg();

    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Del
    const seed2 = await seedWithOrg();
    const res = await t.fetch.delete(`/0/invitations/${post.json.data.id}`, {
      token: seed2.token,
    });
    isError(res.json);
    expect(res.statusCode).toBe(403);
  });
});
