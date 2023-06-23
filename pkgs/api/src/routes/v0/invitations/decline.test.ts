import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id.js';
import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /invitations/:id/decline', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/invitations/foobar/decline');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/invitations/foobar/decline', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should decline one invitation', async () => {
    const { token, org } = await seedWithOrg();
    const seed2 = await seedSimpleUser();

    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: seed2.user.email, role: 'viewer' },
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
    const decline = await t.fetch.post(
      `/0/invitations/${post.json.data.id}/decline`,
      {
        token: seed2.token,
        Querystring: { token: post.json.data.token },
      }
    );
    isSuccess(decline.json);
    expect(decline.statusCode).toBe(200);
    expect(decline.json).toStrictEqual({ done: true });

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
    const res = await t.fetch.post(`/0/invitations/${fakeid}/decline`, {
      token,
      Querystring: { token: nanoid(32) },
    });

    isError(res.json);
    expect(res.statusCode).toBe(404);
  });

  it('should reject declining an other org invitation', async () => {
    const { token, org } = await seedWithOrg();

    // Create
    const post = await t.fetch.post('/0/invitations', {
      token,
      Body: { orgId: org.id, email: 'foobar@example.com', role: 'viewer' },
    });
    isSuccess(post.json);

    // decline
    const seed2 = await seedWithOrg();
    const res = await t.fetch.post(
      `/0/invitations/${post.json.data.id}/decline`,
      {
        token: seed2.token,
        Querystring: { token: post.json.data.token },
      }
    );
    isError(res.json);
    expect(res.statusCode).toBe(403);
  });
});
