// eslint-disable-next-line import/extensions
import '@specfy/stack-analyser/dist/autoload.js';
import { describe, expect, it } from 'vitest';

import { getTechFromFileList } from '.';

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
