import { getApiBlobDocument } from '@specfy/models/src/documents/test.utils';
import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { diffDocument } from './diffDocument';

import { createEditorSchema } from '@/components/Editor/extensions';

const editor = new Editor(createEditorSchema());

describe('diffDocument', () => {
  it('should find no diff when deleted', () => {
    const a = getApiBlobDocument({ id: 'a', orgId: 'a' });
    a.deleted = true;
    const diff = diffDocument(editor, a);
    expect(diff).toStrictEqual([]);
  });

  it('should find no diff when nothing has changed', () => {
    const a = getApiBlobDocument({ id: 'a', orgId: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    const diff = diffDocument(editor, a);
    expect(diff).toStrictEqual([]);
  });
});

describe('content', () => {
  it('should find diff', () => {
    const a = getApiBlobDocument({ id: 'a', orgId: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.content = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [], attrs: { uid: 'a' } }],
    });
    const diff = diffDocument(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'content',
      diff: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: 'a' },
            content: [],
            marks: [{ attrs: { type: 'added' }, type: 'diffMark' }],
          },
        ],
      },
    });
  });
});

describe('name', () => {
  it('should find diff', () => {
    const a = getApiBlobDocument({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.name = 'hello';
    const diff = diffDocument(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'name',
      diff: [
        {
          added: undefined,
          count: 3,
          removed: true,
          // value: 'test xDf8lIDzlyJP',
        },
        {
          added: true,
          count: 1,
          removed: undefined,
          value: 'hello',
        },
      ],
    });
  });
});
