import type { Projects } from '@specfy/db';
import { describe, expect, it } from 'vitest';

import { DocumentsParser } from './markdownParser.js';

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
