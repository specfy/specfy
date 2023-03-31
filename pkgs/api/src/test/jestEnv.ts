import { TestEnvironment as NodeEnvironment } from 'jest-environment-node';

import { db } from '../db';

export default class MiniflareEnvironment extends NodeEnvironment {
  async setup(): Promise<void> {
    // await truncate();
  }

  async teardown(): Promise<void> {
    await db.close();
  }
}
