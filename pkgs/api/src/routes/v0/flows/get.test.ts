import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('GET /flows/:flow_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.get('/0/flows/foobarfoobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.get('/0/flows/foobarfoobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should get a flow', async () => {
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get(`/0/flows/${org.flowId}`, {
      token,
      Querystring: {
        org_id: org.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json.data).toStrictEqual({
      flow: {
        edges: [],
        nodes: [],
      },
      id: expect.any(String),
      createdAt: expect.toBeIsoDate(),
      updatedAt: expect.toBeIsoDate(),
    });
  });

  it('should error on wrong orgId', async () => {
    const { token, org } = await seedWithProject();
    const res = await t.fetch.get(`/0/flows/${org.flowId}`, {
      token,
      Querystring: {
        org_id: 'foobar',
      },
    });

    expect(res.statusCode).toBe(403);
  });
});
