import type { Components, Orgs, Projects } from '@prisma/client';
import type { AnalyserJson } from '@specfy/stack-analyser';
import { Payload } from '@specfy/stack-analyser';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../../test/seed/components.js';
import type { PostUploadRevision } from '../../types/api/index.js';

import { uploadedStackToDB } from './helpers.stack.js';

function getDefault(): AnalyserJson {
  return new Payload({ name: 'default', folderPath: '/' }).toJson();
}
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
    expect(res2.blobs[0].typeId).toEqual(res.blobs[0].typeId);
    expect(res2.blobs[1].typeId).toEqual(res.blobs[1].typeId);
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
    expect(res2.blobs[0].typeId).toEqual(up.id);
    expect(res2.blobs[0].current.id).toEqual(up.id);
    expect(res2.blobs[1].current.edges[0].target).toEqual(up.id);
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
    expect(res2.deleted[0].typeId).toEqual(up.id);
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
          ...(getBlobComponent(
            { id: 'acme' } as Orgs,
            { id: 'foobar' } as Projects
          ) as unknown as Components),
        },
      ],
      { source: 'github' } as PostUploadRevision['Body']
    );

    expect(res.deleted).toHaveLength(0);
  });
});
