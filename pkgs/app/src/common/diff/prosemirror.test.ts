import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createEditorSchema } from '../../components/Editor';
import { getEmptyDoc } from '../content';

import { diffEditor } from './prosemirror';

describe('diff', () => {
  const editor = new Editor({
    ...createEditorSchema({}),
    content: getEmptyDoc(),
  });

  it('has no diff', () => {
    const diff = diffEditor(editor.schema, getEmptyDoc(), getEmptyDoc());
    expect(diff).toStrictEqual({ type: 'doc', content: [] });
  });

  it('has a new paragraph', () => {
    const diff = diffEditor(editor.schema, getEmptyDoc(), {
      type: 'doc',
      content: [{ type: 'paragraph', attrs: { uid: '1' } }],
    });
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { uid: '1' }, diff: { added: true } },
      ],
    });
  });

  it('has removed paragraph', () => {
    const diff = diffEditor(
      editor.schema,
      {
        type: 'doc',
        content: [{ type: 'paragraph', attrs: { uid: '1' } }],
      },
      getEmptyDoc()
    );
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          diff: { removed: true, moved: false },
        },
      ],
    });
  });

  it('has moved paragraph', () => {
    const diff = diffEditor(
      editor.schema,
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '1' } },
          { type: 'paragraph', attrs: { uid: '2' } },
        ],
      },
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '2' } },
          { type: 'paragraph', attrs: { uid: '1' } },
        ],
      }
    );
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          diff: { removed: true, moved: true },
        },
        { type: 'paragraph', attrs: { uid: '2' }, diff: { unchanged: true } },
        { type: 'paragraph', attrs: { uid: '1' }, diff: { added: true } },
      ],
    });
  });

  it('should not move next when removed', () => {
    const diff = diffEditor(
      editor.schema,
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '1' } },
          { type: 'paragraph', attrs: { uid: '2' } },
          { type: 'paragraph', attrs: { uid: '3' } },
        ],
      },
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '2' } },
          { type: 'paragraph', attrs: { uid: '3' } },
        ],
      }
    );
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          diff: { removed: true, moved: false },
        },
        { type: 'paragraph', attrs: { uid: '2' }, diff: { unchanged: true } },
        { type: 'paragraph', attrs: { uid: '3' }, diff: { unchanged: true } },
      ],
    });
  });

  it('should not move next when added', () => {
    const diff = diffEditor(
      editor.schema,
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '1' } },
          { type: 'paragraph', attrs: { uid: '2' } },
        ],
      },
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '0' } },
          { type: 'paragraph', attrs: { uid: '1' } },
          { type: 'paragraph', attrs: { uid: '2' } },
        ],
      }
    );
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        // {
        //   type: 'paragraph',
        //   attrs: { uid: '1' },
        //   diff: { removed: true, moved: true },
        // },
        { type: 'paragraph', attrs: { uid: '0' }, diff: { added: true } },
        { type: 'paragraph', attrs: { uid: '1' }, diff: { unchanged: true } },
        { type: 'paragraph', attrs: { uid: '2' }, diff: { unchanged: true } },
      ],
    });
  });

  it('should prioritize delete', () => {
    const diff = diffEditor(
      editor.schema,
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '1' } },
          { type: 'paragraph', attrs: { uid: '2' } },
        ],
      },
      {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { uid: '3' } },
          { type: 'paragraph', attrs: { uid: '2' } },
        ],
      }
    );
    expect(diff).toStrictEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { uid: '3' }, diff: { added: true } },
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          diff: { removed: true, moved: false },
        },
        { type: 'paragraph', attrs: { uid: '2' }, diff: { unchanged: true } },
      ],
    });
  });
});
