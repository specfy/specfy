import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isError, isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed';

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
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should delete one invitation', async () => {
    const { token, org } = await seedWithOrg();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // List
    const get = await t.fetch.get('/0/invitations', {
      token,
      qp: { org_id: org.id },
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
      qp: { org_id: org.id },
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
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
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
