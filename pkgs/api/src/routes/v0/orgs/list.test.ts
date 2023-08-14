import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithOrg } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /orgs', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/orgs');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/orgs', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should return no orgs', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/orgs', { token });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(0);
  });

  it('should list one org', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.get('/0/orgs', { token });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data).toStrictEqual([
      {
        id: org.id,
        flowId: expect.any(String),
        name: org.name,
        avatarUrl: null,
        color: expect.any(String),
        acronym: expect.any(String),
        githubInstallationId: null,
      },
    ]);
  });

  it('should not list the other user orgs', async () => {
    const seed1 = await seedWithOrg();
    const seed2 = await seedWithOrg();

    // First user receive only it's own org
    const res1 = await t.fetch.get('/0/orgs', { token: seed1.token });
    isSuccess(res1.json);
    expect(res1.statusCode).toBe(200);
    expect(res1.json.data).toHaveLength(1);
    expect(res1.json.data).toStrictEqual([
      {
        id: seed1.org.id,
        flowId: expect.any(String),
        name: seed1.org.name,
        avatarUrl: null,
        color: expect.any(String),
        acronym: expect.any(String),
        githubInstallationId: null,
      },
    ]);

    // Second user receive only it's own org
    const res2 = await t.fetch.get('/0/orgs', { token: seed2.token });
    isSuccess(res2.json);
    expect(res2.statusCode).toBe(200);
    expect(res2.json.data).toHaveLength(1);
    expect(res2.json.data).toStrictEqual([
      {
        id: seed2.org.id,
        flowId: expect.any(String),
        name: seed2.org.name,
        avatarUrl: null,
        color: expect.any(String),
        acronym: expect.any(String),
        githubInstallationId: null,
      },
    ]);
  });
});
