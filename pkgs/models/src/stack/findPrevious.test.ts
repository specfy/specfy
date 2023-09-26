import { Payload } from '@specfy/stack-analyser';
import { describe, expect, it } from 'vitest';

import type { Components } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';

import { getBlobComponent } from '../components/test.utils.js';

import { findPerfectMatch, findPrevious } from './findPrevious.js';

function getDefault(): AnalyserJson {
  return new Payload({ name: 'default', folderPath: '/' }).toJson();
}

describe('findPerfectMatch', () => {
  it('should find perfect', () => {
    const prev = {
      ...(getBlobComponent({
        id: 'foo',
        orgId: 'bar',
      }) as unknown as Components),
      source: 'github',
      sourceName: 'a',
      sourcePath: ['a', 'b'],
    };
    const res = findPerfectMatch({
      child: { ...getDefault(), name: 'a', tech: null, path: ['a', 'b'] },
      prevs: [prev],
      source: 'github',
    });
    expect(res?.id).toBe(prev.id);
  });
  it('should fail on source', () => {
    const prev = {
      ...(getBlobComponent({
        id: 'foo',
        orgId: 'bar',
      }) as unknown as Components),
      source: 'foobar',
      sourceName: 'a',
      sourcePath: ['a', 'b'],
    };
    const res = findPerfectMatch({
      child: { ...getDefault(), name: 'a', tech: null, path: ['a', 'b'] },
      prevs: [prev],
      source: 'github',
    });
    expect(res).toBeNull();
  });
  it('should fail on sourceName', () => {
    const prev = {
      ...(getBlobComponent({
        id: 'foo',
        orgId: 'bar',
      }) as unknown as Components),
      source: 'github',
      sourceName: 'b',
      sourcePath: ['a', 'b'],
    };
    const res = findPerfectMatch({
      child: { ...getDefault(), name: 'a', tech: null, path: ['a', 'b'] },
      prevs: [prev],
      source: 'github',
    });
    expect(res).toBeNull();
  });
  it('should fail on sourcePath.length', () => {
    const prev = {
      ...(getBlobComponent({
        id: 'foo',
        orgId: 'bar',
      }) as unknown as Components),
      source: 'github',
      sourceName: 'b',
      sourcePath: ['a'],
    };
    const res = findPerfectMatch({
      child: { ...getDefault(), name: 'a', tech: null, path: ['a', 'b'] },
      prevs: [prev],
      source: 'github',
    });
    expect(res).toBeNull();
  });
  it('should fail on sourcePath', () => {
    const prev = {
      ...(getBlobComponent({
        id: 'foo',
        orgId: 'bar',
      }) as unknown as Components),
      source: 'github',
      sourceName: 'b',
      sourcePath: ['a', 'c'],
    };
    const res = findPerfectMatch({
      child: { ...getDefault(), name: 'a', tech: null, path: ['a', 'b'] },
      prevs: [prev],
      source: 'github',
    });
    expect(res).toBeNull();
  });
});

describe('findPrevious', () => {
  it('should not match different', () => {
    const res = findPrevious({
      child: { ...getDefault(), name: 'a' },
      prevs: [
        getBlobComponent({ id: 'foo', orgId: 'bar' }) as unknown as Components,
      ],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res).toBeNull();
  });

  it('should match equal', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a' },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(old.name);
  });

  it('should not match same name but different source', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'foobar',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a' },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res).toBeNull();
  });

  it('should not match same source but different name (tech = null)', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      techId: null,
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), tech: null, name: 'b' },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res).toBeNull();
  });

  it('should not match same source, same name but different tech', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a', tech: 'algolia' },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res).toBeNull();
  });

  it('should match same source, same name, same tech', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      techId: 'algolia',
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a', tech: 'algolia' },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(old.name);
  });

  it('should match same source, same name, same tech null but different path (a potential mv)', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/src/a/package.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a', path: ['/package.json'] },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(old.name);
  });

  it('should differentiate match same source, same name, same tech null but different path', () => {
    const oldA = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/src/a/package.json'],
      source: 'github',
    } as unknown as Components;
    const oldB = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/src/b/package.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'a', path: ['/src/b/package.json'] },
      prevs: [oldA, oldB],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.id).toBe(oldB.id);
  });

  it('should match a rename', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/package.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'b', path: ['/package.json'] },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(old.name);
  });

  it('should match a rename with multiple path', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/package.json', '/docker-compose.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: {
        ...getDefault(),
        name: 'b',
        path: ['/package.json', '/docker-compose.json'],
      },
      prevs: [old],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(old.name);
  });

  it('should prioritize exact match', () => {
    const oldA = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/package.json'],
      source: 'github',
    } as unknown as Components;
    const oldB = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'b',
      sourcePath: ['/package.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrevious({
      child: { ...getDefault(), name: 'b', path: ['/package.json'] },
      prevs: [oldA, oldB],
      source: 'github',
      prevIdUsed: [],
    });
    expect(res!.name).toBe(oldB.name);
  });
});
