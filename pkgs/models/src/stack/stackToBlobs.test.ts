import { nanoid } from '@specfy/core';
import type { Components, Projects } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { Payload } from '@specfy/stack-analyser';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../components/index.js';
import type { PostUploadRevision } from '../revisions/index.js';

import { stackToBlobs } from './stackToBlobs.js';
import type { StackToBlobs } from './types.js';

function getDefault(): AnalyserJson {
  return new Payload({ name: 'default', folderPath: '/' }).toJson();
}
function getData() {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return { source: 'github' } as PostUploadRevision['Body'];
}
function short(childs: AnalyserJson[], prevs?: StackToBlobs) {
  return stackToBlobs(
    {
      ...getDefault(),
      childs,
    },
    prevs ? prevs.blobs.map((b) => b.current as unknown as Components) : [],
    getData()
  );
}

describe('stackToBlobs', () => {
  it('should output new blobs once and nothing the second', () => {
    // New upload
    const a: AnalyserJson = { ...getDefault(), name: 'a' };
    const b: AnalyserJson = { ...getDefault(), name: 'b' };
    const res = short([a, b]);
    expect(res.stats).toStrictEqual({
      created: 2,
      deleted: 0,
      modified: 0,
      unchanged: 0,
    });
    expect(res.blobs).toHaveLength(2);
    expect(res.deleted).toHaveLength(0);
    const snap = res.blobs.map((blob) => {
      const copy = {
        ...blob,
        id: expect.any(String),
        typeId: expect.any(String),
        current: {
          ...blob.current,
          id: expect.any(String),
          createdAt: '',
          updatedAt: '',
        },
      };
      return copy;
    });
    expect(snap).toMatchSnapshot();

    // Re-upload
    const c: AnalyserJson = { ...getDefault(), name: 'a' };
    const d: AnalyserJson = { ...getDefault(), name: 'b' };
    const res2 = short([c, d], res);

    expect(res2.stats).toStrictEqual({
      created: 0,
      deleted: 0,
      modified: 0,
      unchanged: 2,
    });
    expect(res2.blobs).toHaveLength(2);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.blobs[0].typeId).toBe(res.blobs[0].typeId);
    expect(res2.blobs[1].typeId).toBe(res.blobs[1].typeId);
    expect(res2.unchanged).toStrictEqual([
      res2.blobs[0].typeId,
      res2.blobs[1].typeId,
    ]);
  });

  it('should detect deleted', () => {
    // New upload
    const up: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const first = short([up]);

    // Re-upload
    const res2 = short([], first);
    expect(res2.stats).toStrictEqual({
      created: 0,
      deleted: 1,
      modified: 0,
      unchanged: 0,
    });
    expect(res2.blobs).toHaveLength(0);
    expect(res2.deleted).toHaveLength(1);
    expect(res2.deleted[0].typeId).toBe(up.id);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should detect deleted edge and component', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const b = { ...getDefault(), name: 'b' };
    a.edges.push({ target: b.id, read: true, write: true });
    const first = short([a, b]);

    // Re-upload, we loose B and the associated edge
    const c = { ...getDefault(), name: 'a' };
    const res2 = short([c], first);
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
    const res = stackToBlobs(
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
      getData()
    );

    expect(res.deleted).toHaveLength(0);
  });

  it('should detect loosing an host', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const b = { ...getDefault(), name: 'b' };
    a.inComponent = b.id;
    const first = short([a, b]);

    // Re-upload, we loose B
    const c = { ...getDefault(), name: 'a' };
    const res2 = short([c], first);
    expect(res2.blobs).toHaveLength(1);
    expect(res2.deleted).toHaveLength(1);
    expect(res2.blobs[0].current.inComponent).toBeNull();
    expect(res2.deleted[0].typeId).toBe(b.id);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should detect adding an host', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const first = short([a]);

    // Re-upload, we add B and it's an host of A
    const b = { ...getDefault(), name: 'b' };
    const c = { ...getDefault(), name: 'a', inComponent: b.id };
    const res2 = short([b, c], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.blobs[1].current.inComponent).toBe(res2.blobs[0].current.id);
    expect(res2.unchanged).toStrictEqual([]);
  });
});

describe('edge cases', () => {
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
    const first = short([a, b]);
    expect(first.blobs).toHaveLength(2);

    // Upload again no change
    a.id = nanoid();
    b.id = nanoid();
    const res2 = short([a, b], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toHaveLength(2);
  });

  it('should not confuse component with the same path', () => {
    // New upload
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/package.json'],
    };
    const first = short([b]);
    expect(first.blobs).toHaveLength(1);

    // Upload again but a is coming before b
    // It's a new component with the same path, we should avoid detecting a rename
    const a: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/package.json'],
    };
    const c: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/package.json'],
    };
    const res2 = short([a, c], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].created).toBe(true);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([b.id]);
  });

  it('should handle two rename (same order)', () => {
    // New upload
    const a: AnalyserJson = { ...getDefault(), name: 'a', path: ['/cmd'] };
    const b: AnalyserJson = { ...getDefault(), name: 'b', path: ['/src'] };

    const first = short([a, b]);
    expect(first.blobs).toHaveLength(2);

    // Upload again both components are renamed but there are staying in the same folder
    const c: AnalyserJson = { ...getDefault(), name: 'c', path: ['/cmd'] };
    const d: AnalyserJson = { ...getDefault(), name: 'd', path: ['/src'] };
    const res2 = short([c, d], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].created).toBe(false);
    expect(res2.blobs[0].typeId).toBe(a.id);
    expect(res2.blobs[1].created).toBe(false);
    expect(res2.blobs[1].typeId).toBe(b.id);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([]);
  });

  it('should handle one folder rename (different order)', () => {
    // New upload
    const a: AnalyserJson = { ...getDefault(), name: 'a', path: ['/cmd'] };
    const b: AnalyserJson = { ...getDefault(), name: 'b', path: ['/src'] };

    const first = short([a, b]);
    expect(first.blobs).toHaveLength(2);

    // Upload again a folder is mv, so it will be matched after
    const c: AnalyserJson = { ...getDefault(), name: 'a', path: ['/z'] };
    const d: AnalyserJson = { ...getDefault(), name: 'b', path: ['/src'] };
    const res2 = short([d, c], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].created).toBe(false);
    expect(res2.blobs[0].typeId).toBe(b.id);
    expect(res2.blobs[1].created).toBe(false);
    expect(res2.blobs[1].typeId).toBe(a.id);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([b.id]);
  });
});

describe('edges', () => {
  it('should up a new edge between two components', () => {
    const a: AnalyserJson = { ...getDefault(), name: 'a' };
    const b: AnalyserJson = { ...getDefault(), name: 'b' };

    const first = short([a, b]);
    expect(first.blobs).toHaveLength(2);
    expect(first.blobs[0].current.edges).toStrictEqual([]);
    expect(first.blobs[1].current.edges).toStrictEqual([]);

    // Upload again a folder is mv, so it will be matched after
    const c: AnalyserJson = { ...getDefault(), name: 'a' };
    const d: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      edges: [{ target: c.id, read: true, write: true }],
    };
    const res2 = short([c, d], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].current.edges).toStrictEqual([]);
    expect(res2.blobs[1].current.edges).toStrictEqual([
      {
        portSource: 'sr',
        portTarget: 'tl',
        read: true,
        source: 'github',
        target: a.id,
        vertices: [],
        write: true,
      },
    ]);
  });

  it('should delete an edge between two components', () => {
    const a: AnalyserJson = { ...getDefault(), name: 'a' };
    const b: AnalyserJson = { ...getDefault(), name: 'b' };
    b.edges = [{ target: a.id, read: true, write: true }];

    const first = short([a, b]);
    expect(first.blobs).toHaveLength(2);
    expect(first.blobs[0].current.edges).toStrictEqual([]);
    expect(first.blobs[1].current.edges).toStrictEqual([
      {
        portSource: 'sr',
        portTarget: 'tl',
        read: true,
        source: 'github',
        target: a.id,
        vertices: [],
        write: true,
      },
    ]);

    // Upload again a folder is mv, so it will be matched after
    const c: AnalyserJson = { ...getDefault(), name: 'a' };
    const d: AnalyserJson = { ...getDefault(), name: 'b' };
    const res2 = short([c, d], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].current.edges).toStrictEqual([]);
    expect(res2.blobs[1].current.edges).toStrictEqual([]);
    expect(res2.stats).toStrictEqual({
      created: 0,
      deleted: 0,
      modified: 1,
      unchanged: 1,
    });
  });

  it('should update id/edges.id when one component was already there', () => {
    // New upload
    const up: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const first = short([up]);

    // Re-upload
    const reup: AnalyserJson = {
      ...getDefault(),
      name: 'coucou',
      tech: 'algolia',
    };
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      edges: [{ target: reup.id, read: true, write: true }],
    };
    const res2 = short([reup, b], first);
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].typeId).toBe(up.id);
    expect(res2.blobs[0].current.id).toBe(up.id);
    expect(res2.blobs[1].current.edges[0].target).toBe(up.id);
    expect(res2.unchanged).toStrictEqual([res2.blobs[0].typeId]);
  });
});

// ('impossible', () => {

// ('should handle two rename (different order)', () => {
//   // New upload
//   const a: AnalyserJson = {
//     ...getDefault(),
//     name: 'a',
//     path: ['/cmd'],
//   };
//   const b: AnalyserJson = {
//     ...getDefault(),
//     name: 'b',
//     path: ['/src'],
//   };
//   const first = stackToBlobs(
//     {
//       ...getDefault(),
//       name: 'coucou',
//       tech: 'algolia',
//       childs: [a, b],
//     },
//     [],
//     {
//       source: 'github',
//     } as PostUploadRevision['Body']
//   );
//   expect(first.blobs).toHaveLength(2);

//   // Upload again both components are renamed but there are staying in the same folder
//   const c: AnalyserJson = {
//     ...getDefault(),
//     name: 'c',
//     path: ['/z'],
//   };
//   const d: AnalyserJson = {
//     ...getDefault(),
//     name: 'd',
//     path: ['/a'],
//   };
//   const res2 = stackToBlobs(
//     {
//       ...getDefault(),
//       name: 'coucou',
//       tech: 'algolia',
//       childs: [c, d],
//     },
//     first.blobs.map((blob) => blob.current as unknown as Components),
//     getData()
//   );
//   console.log(res2);
//   expect(res2.blobs).toHaveLength(2);
//   expect(res2.blobs[0].created).toBe(false);
//   expect(res2.blobs[0].typeId).toBe(b.id);
//   expect(res2.blobs[1].created).toBe(false);
//   expect(res2.blobs[1].typeId).toBe(a.id);
//   expect(res2.deleted).toHaveLength(0);
//   expect(res2.unchanged).toStrictEqual([]);
// });
// })
