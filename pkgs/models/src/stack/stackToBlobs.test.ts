import type { Components, Projects } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { Payload } from '@specfy/stack-analyser';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../components/index.js';
import type { PostUploadRevision } from '../revisions/index.js';

import { stackToBlobs } from './stackToBlobs.js';

function getDefault(): AnalyserJson {
  return new Payload({ name: 'default', folderPath: '/' }).toJson();
}

describe('stackToBlobs', () => {
  it('should output new blobs once and nothing the second', () => {
    // New upload
    const res = stackToBlobs(
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
    const res2 = stackToBlobs(
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
    const first = stackToBlobs(
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
    const res2 = stackToBlobs(
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
    const first = stackToBlobs(
      {
        ...getDefault(),
        childs: [up],
      },
      [],
      { source: 'github' } as PostUploadRevision['Body']
    );

    // Re-upload
    const res2 = stackToBlobs(
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
    const first = stackToBlobs(
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
    const res2 = stackToBlobs(
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
      { source: 'github' } as PostUploadRevision['Body']
    );

    expect(res.deleted).toHaveLength(0);
  });

  it('should detect loosing an host', () => {
    // New upload
    const a = { ...getDefault(), name: 'a' };
    const b = { ...getDefault(), name: 'b' };
    a.inComponent = b.id;
    const first = stackToBlobs(
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
    const res2 = stackToBlobs(
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
    const first = stackToBlobs(
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
    const res2 = stackToBlobs(
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
    const first = stackToBlobs(
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
    const res2 = stackToBlobs(
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

  it('should not confuse component with the same path', () => {
    // New upload
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/package.json'],
    };
    const first = stackToBlobs(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [b],
      },
      [],
      {
        source: 'github',
      } as PostUploadRevision['Body']
    );
    expect(first.blobs).toHaveLength(1);

    // Upload again but a is coming before b
    // It's a new component with the same path, we should avoid detecting a rename
    const a: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/package.json'],
    };
    const res2 = stackToBlobs(
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
    expect(res2.blobs[0].created).toBe(true);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([b.id]);
  });

  it('should handle two rename (same order)', () => {
    // New upload
    const a: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/cmd'],
    };
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/src'],
    };
    const first = stackToBlobs(
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

    // Upload again both components are renamed but there are staying in the same folder
    const c: AnalyserJson = {
      ...getDefault(),
      name: 'c',
      path: ['/cmd'],
    };
    const d: AnalyserJson = {
      ...getDefault(),
      name: 'd',
      path: ['/src'],
    };
    const res2 = stackToBlobs(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [c, d],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
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
    const a: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/cmd'],
    };
    const b: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/src'],
    };
    const first = stackToBlobs(
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

    // Upload again a folder is mv, so it will be matched after
    const c: AnalyserJson = {
      ...getDefault(),
      name: 'a',
      path: ['/z'],
    };
    const d: AnalyserJson = {
      ...getDefault(),
      name: 'b',
      path: ['/src'],
    };
    const res2 = stackToBlobs(
      {
        ...getDefault(),
        name: 'coucou',
        tech: 'algolia',
        childs: [d, c],
      },
      first.blobs.map((blob) => blob.current as unknown as Components),
      { source: 'github' } as PostUploadRevision['Body']
    );
    expect(res2.blobs).toHaveLength(2);
    expect(res2.blobs[0].created).toBe(false);
    expect(res2.blobs[0].typeId).toBe(b.id);
    expect(res2.blobs[1].created).toBe(false);
    expect(res2.blobs[1].typeId).toBe(a.id);
    expect(res2.deleted).toHaveLength(0);
    expect(res2.unchanged).toStrictEqual([b.id]);
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
//     { source: 'github' } as PostUploadRevision['Body']
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
