import type { Components, Projects } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { Payload } from '@specfy/stack-analyser';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../components/index.js';

import { findPrev, uploadedStackToDB } from './helpers.stack.js';
import type { PostUploadRevision } from './types.api.js';

function getDefault(): AnalyserJson {
  return new Payload({ name: 'default', folderPath: '/' }).toJson();
}

describe('findPrev', () => {
  it('should not match different', () => {
    const res = findPrev(
      { ...getDefault(), name: 'a' },
      [getBlobComponent({ id: 'foo', orgId: 'bar' }) as unknown as Components],
      'github'
    );
    expect(res).toBeUndefined();
  });

  it('should match equal', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrev({ ...getDefault(), name: 'a' }, [old], 'github');
    expect(res!.name).toBe(old.name);
  });

  it('should not match same name but different source', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'foobar',
    } as unknown as Components;
    const res = findPrev({ ...getDefault(), name: 'a' }, [old], 'github');
    expect(res).toBeUndefined();
  });

  it('should not match same source but different name', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrev({ ...getDefault(), name: 'b' }, [old], 'github');
    expect(res).toBeUndefined();
  });

  it('should not match same source, same name but different tech', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrev(
      { ...getDefault(), name: 'a', tech: 'algolia' },
      [old],
      'github'
    );
    expect(res).toBeUndefined();
  });

  it('should match same source, same name, same tech', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      techId: 'algolia',
      sourceName: 'a',
      source: 'github',
    } as unknown as Components;
    const res = findPrev(
      { ...getDefault(), name: 'a', tech: 'algolia' },
      [old],
      'github'
    );
    expect(res!.name).toBe(old.name);
  });

  it('should match same source, same name, same tech null but different path (a potential rename)', () => {
    const old = {
      ...getBlobComponent({ id: 'foo', orgId: 'bar' }),
      sourceName: 'a',
      sourcePath: ['/src/a/package.json'],
      source: 'github',
    } as unknown as Components;
    const res = findPrev(
      { ...getDefault(), name: 'a', path: ['/package.json'] },
      [old],
      'github'
    );
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
    const res = findPrev(
      { ...getDefault(), name: 'a', path: ['/src/b/package.json'] },
      [oldA, oldB],
      'github'
    );
    expect(res!.id).toBe(oldB.id);
  });
});

describe('uploadedStackToDB', () => {
  it('should output new blobs once and nothing the second', () => {
    // New upload
    const res = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [
          { ...getDefault(), name: 'a' },
          { ...getDefault(), name: 'b' },
        ],
      },
      [],
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res.blobs).toHaveLength(2);
    expect(res.deleted).toHaveLength(0);
    const snap = res.blobs.map((b) => {
      const copy = {
        ...b,
        id: expect.any(String),
        typeId: expect.any(String),
        current: {
          ...b.current,
          id: expect.any(String),
          createdAt: '',
          updatedAt: '',
        },
      };
      return copy;
    });
    expect(snap).toMatchSnapshot();

    // Re-upload
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [
          { ...getDefault(), name: 'a' },
          { ...getDefault(), name: 'b' },
        ],
      },
      res.blobs.map((b) => b.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(2);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.blobs[0].typeId).toBe(res.blobs[0].typeId);
    expect(res2.blobs[1].typeId).toBe(res.blobs[1].typeId);
    expect(res2.unchanged).toStrictEqual([
      res2.blobs[0].typeId,
      res2.blobs[1].typeId,
    ]);
  });

  it('should update id/edges.id when one component was already there', () => {
    // New upload
    const up: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [up],
      },
      [],
      { source: 'github' } as PostUploadRevision['Body']
    );

    // Re-upload
    const reup: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [
          reup,
          {
            ...getDefault(),
            name: 'b',
            edges: [
              {
                target: reup.id,
                read: true,
                write: true,
              },
            ],
          },
        ],
      },
      first.blobs.map((b) => b.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].typeId).toBe(up.id);
    expect(res2.blobs[0].current.id).toBe(up.id);
    expect(res2.blobs[1].current.edges[0].target).toBe(up.id);
    expect(res2.unchanged).toStrictEqual([res2.blobs[0].typeId]);
  });

  it('should detect deleted', () => {
    // New upload
    const up: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [up],
      },
      [],
      { source: 'github' } as PostUploadRevision['Body']
    );

    // Re-upload
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [],
      },
      first.blobs.map((b) => b.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(0);
    expect(res2.deleted).toHaveLength(1);
    expect(res2.deleted[0].typeId).toBe(up.id);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should detect deleted edge and component', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const b = { ...getDefault(), name: 'b' };
    a.edges.push({
      target: b.id,
      read: true,
      write: true,
    });
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a, b],
      },
      [],
      {
        source: 'github',
      } as PostUploadRevision['Body']
    );

    // Re-upload, we loose B and the associated edge
    a.edges = [];
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(1);
    expect(res2.blobs[0].current.edges).toStrictEqual([]);
    expect(res2.deleted).toHaveLength(1);
    expect(res2.deleted[0].typeId).toBe(b.id);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should not delete different source', () => {
    // New upload
    const up: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const res = uploadedStackToDB(
      {
        ...getDefault(),
        childs: [up],
      },
      [
        {
          ...(getBlobComponent({
            id: 'foobar',
            orgId: 'acme',
          } as Projects) as unknown as Components),
        },
      ],
      { source: 'github' } as PostUploadRevision['Body']
    );

    expect(res.deleted).toHaveLength(0);
  });

  it('should detect loosing an host', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const b = { ...getDefault(), name: 'b' };
    a.inComponent = b.id;
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a, b],
      },
      [],
      {
        source: 'github',
      } as PostUploadRevision['Body']
    );

    // Re-upload, we loose B
    a.inComponent = null;
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(1);
    expect(res2.deleted).toHaveLength(1);
    expect(res2.blobs[0].current.inComponent).toBeNull();
    expect(res2.deleted[0].typeId).toBe(b.id);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should detect adding an host', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a],
      },
      [],
      {
        source: 'github',
      } as PostUploadRevision['Body']
    );

    // Re-upload, we add B and it's an host of A
    const b = { ...getDefault(), name: 'b' };
    a.inComponent = b.id;
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a, b],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].current.inComponent).toBe(res2.blobs[1].current.id);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([]);
  });
});

describe('Unsupported edge cases', () => {
  it('should not confuse component with the same name', () => {
    // New upload
    const a: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/src/package.json'],
    };
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/cmd/api/main.go'],
    };
    const first = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a, b],
      },
      [],
      {
        source: 'github',
      } as PostUploadRevision['Body']
    );
    expect(first.blobs).toHaveLength(2);

    // Upload again no change
    const res2 = uploadedStackToDB(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [a, b],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(2);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([a.id, b.id]);
  });
});
