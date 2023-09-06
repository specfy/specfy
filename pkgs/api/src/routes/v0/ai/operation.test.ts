import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import type { TestSetup } from '../../../test/each.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
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

describe('GET /ai', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/ai');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/ai', {
      token,
      Body: { orgId: 'a', operation: { type: 'rewrite', text: 'a' } },
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/ai', 'POST');
  });

  it('should get a 500 because there is no OpenAI Token', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.post('/0/ai', {
      token,
      Body: { orgId: org.id, operation: { type: 'rewrite', text: 'a' } },
    });

    expect(res.statusCode).toBe(500);
  });
});
