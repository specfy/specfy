import { Editor } from '@tiptap/react';
import type { BlockLevelOne, BlockLevelZero } from 'api/src/types/api';
import { describe, expect, it } from 'vitest';

import { createEditorSchema } from '../../components/Editor';
import { getEmptyDoc } from '../content';

import { diffEditor, findTextNodes } from './prosemirror';

const editor = new Editor({
  ...createEditorSchema({}),
  content: getEmptyDoc(),
});

function doc(content: BlockLevelOne[]): BlockLevelZero {
  return {
    type: 'doc',
    content,
  };
}

describe('findTextNodes', () => {
  it('should find correct text nodes', () => {
    const res = findTextNodes(
      {
        type: 'paragraph',
        attrs: { uid: '1' },
        content: [
          { type: 'text', text: 'Foo' },
          { type: 'hardBreak' },
          { type: 'text', text: 'bar' },
        ],
      },
      0,
      6
    );
    expect(res).toStrictEqual([
      { from: 0, to: 3, node: { type: 'text', text: 'Foo' } },
      { from: 3, to: 4, node: { type: 'hardBreak' } },
      { from: 4, to: 7, node: { type: 'text', text: 'bar' } },
    ]);
  });
});

describe('diff level one', () => {
  it('has no diff', () => {
    const diff = diffEditor(editor.schema, getEmptyDoc(), getEmptyDoc());
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual({
      type: 'doc',
      content: [],
    });
  });

  it('has a new paragraph', () => {
    const diff = diffEditor(
      editor.schema,
      getEmptyDoc(),
      doc([{ type: 'paragraph', attrs: { uid: '1' } }])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
        },
      ])
    );
  });

  it('has removed paragraph', () => {
    const diff = diffEditor(
      editor.schema,
      doc([{ type: 'paragraph', attrs: { uid: '1' } }]),
      getEmptyDoc()
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
        },
      ])
    );
  });

  it('has moved paragraph', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        { type: 'paragraph', attrs: { uid: '1' } },
        { type: 'paragraph', attrs: { uid: '2' } },
      ]),
      doc([
        { type: 'paragraph', attrs: { uid: '2' } },
        { type: 'paragraph', attrs: { uid: '1' } },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '2' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
        },
      ])
    );
  });

  it('should not move next when removed', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        { type: 'paragraph', attrs: { uid: '1' } },
        { type: 'paragraph', attrs: { uid: '2' } },
        { type: 'paragraph', attrs: { uid: '3' } },
      ]),
      doc([
        { type: 'paragraph', attrs: { uid: '2' } },
        { type: 'paragraph', attrs: { uid: '3' } },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '2' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '3' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
      ])
    );
  });

  it('should not move next when added', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        { type: 'paragraph', attrs: { uid: '1' } },
        { type: 'paragraph', attrs: { uid: '2' } },
      ]),
      doc([
        { type: 'paragraph', attrs: { uid: '0' } },
        { type: 'paragraph', attrs: { uid: '1' } },
        { type: 'paragraph', attrs: { uid: '2' } },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        // {
        //   type: 'paragraph',
        //   attrs: { uid: '1' },
        //   marks: [{ type: 'diffMark', attrs: {type: 'removed'}}],
        // },
        {
          type: 'paragraph',
          attrs: { uid: '0' },
          marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '2' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
      ])
    );
  });

  it('should prioritize delete', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        { type: 'paragraph', attrs: { uid: '1' } },
        { type: 'paragraph', attrs: { uid: '2' } },
      ]),
      doc([
        { type: 'paragraph', attrs: { uid: '3' } },
        { type: 'paragraph', attrs: { uid: '2' } },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '3' },
          marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
        },
        {
          type: 'paragraph',
          attrs: { uid: '2' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
        },
      ])
    );
  });
});

describe('diff text', () => {
  it('has no diff', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ])
    );
  });

  it('has no diff split text', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            { type: 'text', text: 'Foo' },
            { type: 'text', text: 'bar' },
          ],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Foo' },
            { type: 'text', text: 'bar' },
          ],
        },
      ])
    );
  });

  it('has diff removed text', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foo' }],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Foo' },
            {
              type: 'text',
              text: 'bar',
              marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
            },
          ],
        },
      ])
    );
  });

  it('has diff added text', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foo' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Foo' },
            {
              type: 'text',
              text: 'bar',
              marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
            },
          ],
        },
      ])
    );
  });

  it('has diff nested text', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'banner',
          attrs: { uid: '1', type: 'error' },
          content: [
            {
              type: 'paragraph',
              attrs: { uid: '2' },
              content: [{ type: 'text', text: 'Hello' }],
            },
          ],
        },
      ]),
      doc([
        {
          type: 'banner',
          attrs: { uid: '1', type: 'error' },
          content: [
            {
              type: 'paragraph',
              attrs: { uid: '2' },
              content: [{ type: 'text', text: 'World' }],
            },
          ],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'banner',
          attrs: { uid: '1', type: 'error' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            {
              type: 'paragraph',
              attrs: { uid: '2' },
              marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
              content: [
                {
                  type: 'text',
                  text: 'Hello',
                  marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
                },
                {
                  type: 'text',
                  text: 'World',
                  marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
                },
              ],
            },
          ],
        },
      ])
    );
  });

  it('has diff added hardBreak', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            { type: 'text', text: 'Foo' },
            { type: 'hardBreak' },
            { type: 'text', text: 'bar' },
          ],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Foo' },
            {
              type: 'hardBreak',
              marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
            },
            {
              type: 'text',
              text: 'bar',
            },
          ],
        },
      ])
    );
  });

  it('has diff removed hardBreak', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            { type: 'text', text: 'Foo' },
            { type: 'hardBreak' },
            { type: 'text', text: 'bar' },
          ],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Foo' },
            {
              type: 'hardBreak',
              marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
            },
            {
              type: 'text',
              text: 'bar',
            },
          ],
        },
      ])
    );
  });
});

describe('diff formatting', () => {
  it('has diff with new mark', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            { type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] },
          ],
        },
      ])
    );

    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            {
              type: 'text',
              text: 'Foobar',
              marks: [{ type: 'bold' }],
              diff: { marked: true },
            },
          ],
        },
      ])
    );
  });

  it('has diff with removed mark', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            { type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] },
          ],
        },
      ]),
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [{ type: 'text', text: 'Foobar' }],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [{ type: 'text', text: 'Foobar', diff: { marked: true } }],
        },
      ])
    );
  });
});

describe('diff attributes', () => {
  it('has diff when changing type', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'banner',
          attrs: { uid: '1', type: 'error' },
          content: [],
        },
      ]),
      doc([
        {
          type: 'banner',
          attrs: { uid: '1', type: 'warning' },
          content: [],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'banner',
          marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
          attrs: { uid: '1', type: 'error' },
          content: [],
        },
        {
          type: 'banner',
          marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
          attrs: { uid: '1', type: 'warning' },
          content: [],
        },
      ])
    );
  });
});
