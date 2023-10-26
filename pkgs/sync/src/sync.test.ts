import path from 'node:path';

import { dirname, type Logger } from '@specfy/core';
import { describe, expect, it } from 'vitest';

import { ErrorSync, sync } from './sync.js';

import type { SyncOptions } from './sync.js';

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
    sourceId: 'c',
    token: '',
    autoLayout: true,
    settings: {
      documentation: { enabled: true, path: `/` },
      stack: { enabled: true, path: `/` },
    },
  };
}
describe('sync', () => {
  it('should stop if nothing is enabled', async () => {
    const { msgs, logger } = getLogger();
    const config = syncDefault();
    config.settings.documentation.enabled = false;
    config.settings.stack.enabled = false;

    const res = await sync({ ...config, logger });

    expect(res).toBeUndefined();
    expect(msgs).toMatchSnapshot();
  });

  it('should break if path does not exists', async () => {
    const { msgs, logger } = getLogger();
    const config = syncDefault();
    config.settings.stack.enabled = false;

    await expect(() => {
      return sync({ ...config, logger });
    }).rejects.toThrowError(new Error('sync_invalid_path'));
    expect(msgs).toMatchSnapshot();
  });

  it('should fail to upload', async () => {
    const { msgs, logger } = getLogger();
    const root = path.join(dirname, '../api/src/test/__fixtures__');
    const config = syncDefault(root);
    config.settings.stack.enabled = false;

    await expect(() => {
      return sync({ ...config, logger });
    }).rejects.toThrowError(new ErrorSync('failed_to_upload'));

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
