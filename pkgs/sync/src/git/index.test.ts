// eslint-disable-next-line import/extensions
import '@specfy/stack-analyser/dist/autoload.js';
import { describe, expect, it } from 'vitest';

import { formatCommitInfo, getTechFromFileList } from '.';

describe('getTechFromFileList', () => {
  it('should find nothing', () => {
    const res = getTechFromFileList([]);
    expect(res).toStrictEqual(new Set());
  });

  it('should find react, nodejs', () => {
    const res = getTechFromFileList(['package.json', 'src/index.tsx']);
    expect(res).toStrictEqual(new Set(['nodejs', 'react', 'typescript']));
  });

  it('should find typescript, golang', () => {
    const res = getTechFromFileList(['main.go', 'scripts/index.ts']);
    expect(res).toStrictEqual(new Set(['golang', 'typescript']));
  });
});

describe('formatCommitInfo', () => {
  it('should do nothing', () => {
    const res = formatCommitInfo(['']);
    expect(res).toBeNull();
  });

  it('should format a commit with a single author', () => {
    const res = formatCommitInfo([
      'hash: 005801b00f42e8bedeb04772cae8aef17b650bab',
      'name: github-actions[bot]',
      'email: github[bot]@users.noreply.github.com',
      'date: 2023-10-30 17:00:47 +0100',
    ]);
    expect(res).toStrictEqual({
      authors: [
        {
          email: 'github[bot]@users.noreply.github.com',
          name: 'github-actions[bot]',
        },
      ],
      date: new Date('2023-10-30T16:00:47.000Z'),
      hash: '005801b00f42e8bedeb04772cae8aef17b650bab',
    });
  });

  it('should format a commit with a co-authors', () => {
    const res = formatCommitInfo([
      'hash: 005801b00f42e8bedeb04772cae8aef17b650bab',
      'name: github-actions[bot]',
      'email: github[bot]@users.noreply.github.com',
      'date: 2023-10-30 17:00:47 +0100',
      'Co-authored-by: renovate[bot] <28139614+renovate[bot]@users.noreply.github.com>',
      'Co-authored-by: John Doe <john@doe.com>',
      'Co-authored-by: éloise_chA! <elo+ise@example.com>',
    ]);
    expect(res).toStrictEqual({
      authors: [
        {
          email: 'github[bot]@users.noreply.github.com',
          name: 'github-actions[bot]',
        },
        {
          email: '28139614+renovate[bot]@users.noreply.github.com',
          name: 'renovate[bot]',
        },
        { email: 'john@doe.com', name: 'John Doe' },
        { email: 'elo+ise@example.com', name: 'éloise_chA!' },
      ],
      date: new Date('2023-10-30T16:00:47.000Z'),
      hash: '005801b00f42e8bedeb04772cae8aef17b650bab',
    });
  });
});
