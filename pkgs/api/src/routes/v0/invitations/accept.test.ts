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

describe('POST /invitations/:id/accept', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/invitations/foobar/accept');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/invitations/foobar/accept', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should accept one invitation', async () => {
    const { token, org } = await seedWithOrg();
    const seed2 = await seedSimpleUser();

    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: seed2.user.email, role: 'viewer' },
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

    // Accept
    const accept = await t.fetch.post(
      `/0/invitations/${post.json.data.id}/accept`,
      {
        token: seed2.token,
        qp: { token: post.json.data.token },
      }
    );
    isSuccess(accept.json);
    expect(accept.statusCode).toBe(200);
    expect(accept.json).toStrictEqual({ done: true });

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
    const res = await t.fetch.post(`/0/invitations/${fakeid}/accept`, {
      token,
      qp: { token: nanoid(32) },
    });

    isError(res.json);
    expect(res.statusCode).toBe(404);
  });

  it('should reject accepting an other user invitation', async () => {
    const { token, org } = await seedWithOrg();
    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Get
    const get = await t.fetch.get(`/0/invitations/${post.json.data.id}`, {
      token,
      qp: { token: post.json.data.token },
    });
    isError(get.json);
    expect(get.statusCode).toBe(403);
  });

  it('should reject accepting an other org invitation', async () => {
    const { token, org } = await seedWithOrg();

    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // Del
    const seed2 = await seedWithOrg();
    const res = await t.fetch.post(
      `/0/invitations/${post.json.data.id}/accept`,
      {
        token: seed2.token,
        qp: { token: post.json.data.token },
      }
    );
    isError(res.json);
    expect(res.statusCode).toBe(403);
  });
});
