import type { FastifyInstance } from 'fastify';
import fastify from 'fastify';

import buildApp from '../app.js';

import { ApiClient } from './fetch.js';

export type TestSetup = {
  app: FastifyInstance;
  fetch: ApiClient;
};

export async function setupBeforeAll(): Promise<TestSetup> {
  const app = fastify();
  await buildApp(app, {});
  await app.listen();

  const fetch = new ApiClient((app.server.address() as any)?.port);

  return { app, fetch };
}

export async function setupAfterAll(ts: Partial<TestSetup>) {
  await ts.app?.close();
  if (ts.fetch) {
    await ts.fetch.close();
  }
}
