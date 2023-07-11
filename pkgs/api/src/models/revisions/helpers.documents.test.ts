import { describe, expect, it } from 'vitest';

import { uploadToDocuments } from './helpers.document.js';

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
      { path: '/', content: expect.any(Object) },
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
      { path: '/', content: expect.any(Object) },
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
    expect(res[2].content.content[0].content[0].text).toEqual('Index');
    // @ts-expect-error Expect our content
    expect(res[3].content.content[0].content[0].text).toEqual('My Foobar');
  });

  it('should handle deep folder', () => {
    const res = uploadToDocuments([
      { content: '# My Title', path: '/README.md' },
      { content: '# My Foobar', path: '/very/nested/folder/foobar.md' },
    ]);

    expect(res).toMatchObject([
      {
        path: '/',
        content: { type: 'doc', content: expect.any(Array) },
      },
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
