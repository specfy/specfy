import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { FSProvider, listing } from '../index.js';

import type { ProviderFile } from '../provider/base.js';

describe('listing', () => {
  it('should list files', async () => {
    const root = path.join(__dirname, '../../tests/__fixtures__/nested_folder');
    const provider = new FSProvider({
      path: root,
      ignorePaths: [],
    });

    const list: ProviderFile[] = [];
    await listing(
      {
        provider,
        acc: list,
      },
      '/'
    );

    expect(list).toStrictEqual([
      {
        fp: '/folder1/folder2/foobar.md',
        name: 'foobar.md',
        type: 'file',
      },
      {
        fp: '/folder1/world.md',
        name: 'world.md',
        type: 'file',
      },
      {
        fp: '/hello.md',
        name: 'hello.md',
        type: 'file',
      },
    ]);
  });
});
