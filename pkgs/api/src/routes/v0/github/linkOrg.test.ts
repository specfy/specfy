import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupAfterAll, setupBeforeAll } from '../../../test/each.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedSimpleUser, seedWithOrgViewer } from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /github/link_org', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/github/link_org');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/github/link_org', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org } = await seedWithOrgViewer();
    const res = await t.fetch.post(`/0/github/link_org`, {
      token,
      Body: { orgId: org.id, installationId: 1 },
    });

    expect(res.statusCode).toBe(403);
  });
});
