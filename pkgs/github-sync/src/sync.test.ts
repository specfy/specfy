import path from 'node:path';

import { dirname, type Logger } from '@specfy/core';
import { describe, expect, it } from 'vitest';

import type { SyncOptions } from './sync.js';
import { ErrorSync, sync } from './sync.js';

function getLogger() {
  const msgs: Array<Array<string | object>> = [];
  const log = (...args: string[]) => msgs.push(args);
  const logger: Logger = {
    info: log,
    error: log,
    warn: log,
    debug: log,
    fatal: log,
  } as unknown as Logger;
  return { msgs, logger };
}

function syncDefault(folder?: string): Omit<SyncOptions, 'logger'> {
  const root = folder || '/tmp/fdokfldkjlkgs';
  return {
    root,
    orgId: 'acme',
    projectId: 'dkjdkjf',
    token: '',
    autoLayout: true,
    docEnabled: true,
    docPath: `${root}/`,
    stackEnabled: true,
    stackPath: `${root}/`,
  };
}
describe('sync', () => {
  it('should stop if nothing is enabled', async () => {
    const { msgs, logger } = getLogger();
    const res = await sync({
      ...syncDefault(),
      logger,
      docEnabled: false,
      stackEnabled: false,
    });
    expect(res).toBeUndefined();
    expect(msgs).toMatchSnapshot();
  });

  it('should break if path does not exists', async () => {
    const { msgs, logger } = getLogger();
    await expect(() =>
      sync({
        ...syncDefault(),
        logger,
        docEnabled: true,
        stackEnabled: false,
      })
    ).rejects.toThrowError(new Error('sync_invalid_path'));
    expect(msgs).toMatchSnapshot();
  });

  it('should fail to upload', async () => {
    const { msgs, logger } = getLogger();
    const root = path.join(dirname, '../api/src/test/__fixtures__');
    await expect(() =>
      sync({
        ...syncDefault(root),
        logger,
        stackEnabled: false,
      })
    ).rejects.toThrowError(new ErrorSync('failed_to_upload'));

    // Clean snapshot
    msgs.forEach((row) =>
      row.forEach((msg, i) => {
        if (typeof msg === 'string') {
          row[i] = msg.replace(root, '');
        }
      })
    );
    expect(msgs).toMatchSnapshot();
  });
});
