import { describe, expect, it } from 'vitest';

import type { PostUploadRevision } from '../../types/api/revisions.js';

import {
  uploadedDocumentsToDB,
  uploadToDocuments,
} from './helpers.document.js';

import '../../test/helpers.js';

describe('uploadToDocuments', () => {
  it('should output nothing', () => {
    const res = uploadToDocuments([]);
    expect(res).toStrictEqual([]);
  });

  it('should create a document with a title', () => {
    const res = uploadToDocuments([
      { content: '# My Title', path: '/README.md' },
    ]);
    expect(res).toMatchInlineSnapshot([
      {
        content: {
          content: [
            {
              attrs: {
                level: 1,
                uid: expect.any(String),
              },
              content: [
                {
                  text: 'My Title',
                  type: 'text',
                },
              ],
              type: 'heading',
            },
          ],
          type: 'doc',
        },
        path: '/README.md',
      },
    ]);
  });

  it('should match create an empty folder', () => {
    const res = uploadToDocuments([
      { content: '# My Title', path: '/README.md' },
      { content: '# My Foobar', path: '/nested/foobar.md' },
    ]);

    expect(res).toMatchObject([
      {
        path: '/README.md',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/nested',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/nested/foobar.md',
        content: { type: 'doc', content: expect.any(Array) },
      },
    ]);
    // @ts-expect-error Expect no content in fake folder
    expect(res[1].content.content[0].content[0].text).toEqual('Nested');
    // @ts-expect-error Expect our content
    expect(res[2].content.content[0].content[0].text).toEqual('My Foobar');
  });

  it('should handle deep folder', () => {
    const res = uploadToDocuments([
      { content: '# My Title', path: '/README.md' },
      { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
    ]);

    expect(res).toMatchObject([
      {
        path: '/README.md',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/very',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/very/nested',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/very/nested/folder',
        content: { type: 'doc', content: expect.any(Array) },
      },
      {
        path: '/very/nested/folder/foobar.md',
        content: { type: 'doc', content: expect.any(Array) },
      },
    ]);
  });
});

describe('uploadedDocumentsToDB', () => {
  const payload: PostUploadRevision['Body'] = {
    source: 'github',
    orgId: 'a',
    projectId: 'b',
    blobs: [],
    description: { type: 'doc', content: [] },
    name: 'Foobar',
    stack: null,
  };

  it('should output nothing', () => {
    const res = uploadedDocumentsToDB(uploadToDocuments([]), [], payload);

    expect(res).toStrictEqual({
      blobs: [],
      deleted: [],
    });
  });

  it('should output a readme', () => {
    const res = uploadedDocumentsToDB(
      uploadToDocuments([{ content: '# My Title', path: '/README.md' }]),
      [],
      payload
    );

    expect(res).toStrictEqual({
      deleted: [],
      blobs: [
        {
          created: true,
          deleted: false,
          parentId: null,
          type: 'document',
          typeId: expect.any(String),
          current: {
            blobId: null,
            content: {
              content: [],
              type: 'doc',
            },
            id: expect.any(String),
            locked: false,
            name: 'Readme',
            orgId: 'a',
            parentId: null,
            projectId: 'b',
            slug: 'readme',
            source: 'github',
            sourcePath: '/README.md',
            tldr: '',
            type: 'doc',
            typeId: null,
            createdAt: expect.toBeIsoDate(),
            updatedAt: expect.toBeIsoDate(),
          },
        },
      ],
    });
  });

  it('should handle nested doc', () => {
    const res = uploadedDocumentsToDB(
      uploadToDocuments([
        { content: '# My Title', path: '/README.md' },
        { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
      ]),
      [],
      payload
    );

    expect(res.blobs).toHaveLength(5);
    expect(res.blobs[0].current.parentId).toBeNull();
    expect(res.blobs[1].current.parentId).toBeNull();
    expect(res.blobs[2].current.parentId).toBe(res.blobs[1].current.id);
    expect(res.blobs[3].current.parentId).toBe(res.blobs[2].current.id);
    expect(res.blobs[4].current.parentId).toBe(res.blobs[3].current.id);
  });
});
