import type { Projects } from '@specfy/db';
import { describe, expect, it } from 'vitest';

import { DocumentsParser, uploadedDocumentsToDB } from './helpers.document.js';
import type { PostUploadRevision } from './types.api.js';

describe('parser()', () => {
  it('should output nothing', () => {
    const parser = new DocumentsParser([], {} as Projects);
    const res = parser.parse();
    expect(res).toStrictEqual([]);
  });

  it('should create a document with a title', () => {
    const parser = new DocumentsParser(
      [{ content: '# My Title', path: '/README.md' }],
      {} as Projects
    );
    const res = parser.parse();
    expect(res).toMatchObject([
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
    const parser = new DocumentsParser(
      [
        { content: '# My Title', path: '/README.md' },
        { content: '# My Foobar', path: '/nested/foobar.md' },
      ],
      {} as Projects
    );
    const res = parser.parse();

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
    const parser = new DocumentsParser(
      [
        { content: '# My Title', path: '/README.md' },
        { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
      ],
      {} as Projects
    );
    const res = parser.parse();

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

  it('should not change absolute link', () => {
    const parser = new DocumentsParser(
      [{ content: '[a link](https://example.com)', path: '/README.md' }],
      {} as Projects
    );
    const res = parser.parse();

    expect(
      (res as any)[0].content.content[0].content?.[0].marks?.[0].attrs.href
    ).toMatchObject('https://example.com');
  });
  it('should add header prefix to relative (same link)', () => {
    const parser = new DocumentsParser(
      [{ content: '[a link](#foobar)', path: '/README.md' }],
      {} as Projects
    );
    const res = parser.parse();

    expect(
      (res as any)[0].content.content[0].content?.[0].marks?.[0].attrs.href
    ).toMatchObject('#h-foobar');
  });
  it('should remove .md from relative link', () => {
    const parser = new DocumentsParser(
      [
        {
          content: '[1link](./1.md) [2link](../2.md) [3link](/3.md)',
          path: '/README.md',
        },
      ],
      { orgId: 'acme', slug: 'hello' } as Projects
    );
    const res = parser.parse();

    expect(
      (res as any)[0].content.content[0].content?.[0].marks?.[0].attrs.href
    ).toMatchObject('./1');
    expect(
      (res as any)[0].content.content[0].content?.[2].marks?.[0].attrs.href
    ).toMatchObject('../2');
    expect(
      (res as any)[0].content.content[0].content?.[4].marks?.[0].attrs.href
    ).toMatchObject('/3');
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
    const parser = new DocumentsParser([], {} as Projects);
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res).toStrictEqual({
      blobs: [],
      deleted: [],
    });
  });

  it('should output a readme', () => {
    const parser = new DocumentsParser(
      [{ content: '# My Title', path: '/README.md' }],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

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
            slug: 'README',
            source: 'github',
            sourcePath: '/README.md',
            tldr: '',
            type: 'doc',
            typeId: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
      ],
    });
  });

  it('should handle nested doc', () => {
    const parser = new DocumentsParser(
      [
        { content: '# My Title', path: '/README.md' },
        { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
      ],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res.blobs).toHaveLength(5);
    expect(res.blobs[0].current.parentId).toBeNull();
    expect(res.blobs[1].current.parentId).toBeNull();
    expect(res.blobs[2].current.parentId).toBe(res.blobs[1].current.id);
    expect(res.blobs[3].current.parentId).toBe(res.blobs[2].current.id);
    expect(res.blobs[4].current.parentId).toBe(res.blobs[3].current.id);
  });

  it('should handle unordered files', () => {
    const parser = new DocumentsParser(
      [
        { content: '# My Foobar', path: '/folder/foobar.md' },
        { content: '# My Title', path: '/folder' },
      ],
      {} as Projects
    );
    const res = uploadedDocumentsToDB(parser.parse(), [], payload);

    expect(res.blobs).toHaveLength(2);
  });
});
