import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import type {
  BlockLevelOne,
  BlockLevelZero,
  BlockParagraph,
} from '@specfy/models';

import { getEmptyDoc } from '../content';
import { createEditorSchema } from '@/components/Editor/extensions';

import { diffEditor, findTextNodes } from './prosemirror';

const editor = new Editor({
  ...createEditorSchema(),
  content: getEmptyDoc(),
});

function doc(content: BlockLevelOne[]): BlockLevelZero {
  return {
    type: 'doc',
    content,
  };
}
function p(content: BlockParagraph['content']): BlockLevelZero {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { uid: '1' },
        content,
      },
    ],
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
      p([{ type: 'text', text: 'Foobar' }]),
      p([{ type: 'text', text: 'Foobar' }])
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
      p([{ type: 'text', text: 'Foobar' }]),
      p([
        { type: 'text', text: 'Foo' },
        { type: 'text', text: 'bar' },
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
      p([{ type: 'text', text: 'Foobar' }]),
      p([{ type: 'text', text: 'Foo' }])
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
      p([{ type: 'text', text: 'Foo' }]),
      p([{ type: 'text', text: 'Foobar' }])
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
      p([{ type: 'text', text: 'Foobar' }]),
      p([
        { type: 'text', text: 'Foo' },
        { type: 'hardBreak' },
        { type: 'text', text: 'bar' },
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
      p([
        { type: 'text', text: 'Foo' },
        { type: 'hardBreak' },
        { type: 'text', text: 'bar' },
      ]),
      p([{ type: 'text', text: 'Foobar' }])
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
  it('has no diff', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }]),
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }])
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
            },
          ],
        },
      ])
    );
  });

  it('has no diff regrouped mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([
        { type: 'text', text: 'Foo', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'bar', marks: [{ type: 'bold' }] },
      ]),
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }])
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
            },
          ],
        },
      ])
    );
  });

  it('has diff with partial mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Foobar' }]),
      p([
        { type: 'text', text: 'Foo' },
        { type: 'text', text: 'bar', marks: [{ type: 'bold' }] },
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
              marks: [
                { type: 'diffMark', attrs: { type: 'formatting' } },
                { type: 'bold' },
              ],
            },
          ],
        },
      ])
    );
  });

  it('has diff with replaced mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }]),
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'code' }] }])
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
              marks: [
                { type: 'diffMark', attrs: { type: 'formatting' } },
                { type: 'code' },
              ],
            },
          ],
        },
      ])
    );
  });

  it('has no diff with unordered mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([
        {
          type: 'text',
          text: 'Foobar',
          marks: [{ type: 'bold' }, { type: 'code' }],
        },
      ]),
      p([
        {
          type: 'text',
          text: 'Foobar',
          marks: [{ type: 'code' }, { type: 'bold' }],
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
              marks: [{ type: 'bold' }, { type: 'code' }],
            },
          ],
        },
      ])
    );
  });

  it('has diff with new mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Foobar' }]),
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }])
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
              marks: [
                { type: 'diffMark', attrs: { type: 'formatting' } },
                { type: 'bold' },
              ],
            },
          ],
        },
      ])
    );
  });

  it('has diff with removed mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Foobar', marks: [{ type: 'bold' }] }]),
      p([{ type: 'text', text: 'Foobar' }])
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
              marks: [{ type: 'diffMark', attrs: { type: 'formatting' } }],
            },
          ],
        },
      ])
    );
  });

  it('has diff with split lines + new mark', () => {
    const diff = diffEditor(
      editor.schema,
      p([{ type: 'text', text: 'Lorem ipsum dolor sit amet.' }]),
      p([
        { type: 'text', text: 'Lorem ipsum ' },
        { type: 'text', text: 'dolor', marks: [{ type: 'code' }] },
        { type: 'text', text: ' sit amet.' },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            { type: 'text', text: 'Lorem ipsum ' },
            {
              type: 'text',
              text: 'dolor',
              marks: [
                { type: 'diffMark', attrs: { type: 'formatting' } },
                { type: 'code' },
              ],
            },
            { type: 'text', text: ' sit amet.' },
          ],
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

describe('diff codeBlock', () => {
  it('has no diff', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          content: [
            {
              type: 'text',
              text: 'function getDocument(req: Req) {\n const tmp = null; return tmp; \n}',
            },
          ],
        },
      ]),
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          content: [
            {
              type: 'text',
              text: 'function getDocument(req: Req) {\n const tmp = null; return tmp; \n}',
            },
          ],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            {
              type: 'text',
              text: 'function getDocument(req: Req) {\n const tmp = null; return tmp; \n}',
            },
          ],
        },
      ])
    );
  });

  it('has diff when changing code', () => {
    const diff = diffEditor(
      editor.schema,
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          content: [
            {
              type: 'text',
              text: 'function getDocument(req: Req) {\n const tmp = null; return tmp; \n}',
            },
          ],
        },
      ]),
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          content: [
            {
              type: 'text',
              text: 'function getDocuments(req: Req) {\n return []; \n}',
            },
          ],
        },
      ])
    );
    expect(JSON.parse(JSON.stringify(diff))).toStrictEqual(
      doc([
        {
          type: 'codeBlock',
          attrs: { uid: '1', language: 'js' },
          codeDiff: {
            newEndingNewLine: false,
            newMode: '100644',
            newPath: '',
            newRevision: '2222222',
            oldEndingNewLine: false,
            oldMode: '100644',
            oldPath: '',
            oldRevision: '1111111',
            type: 'modify',
            hunks: [
              {
                content: '@@ -1,3 +1,3 @@',
                // @ts-expect-error
                isPlain: false,
                newLines: 3,
                newStart: 1,
                oldLines: 3,
                oldStart: 1,
                changes: [
                  {
                    content: 'function getDocument(req: Req) {',
                    isDelete: true,
                    lineNumber: 1,
                    type: 'delete',
                  },
                  {
                    content: 'function getDocuments(req: Req) {',
                    isInsert: true,
                    lineNumber: 1,
                    type: 'insert',
                  },
                  {
                    content: ' const tmp = null; return tmp; ',
                    isDelete: true,
                    lineNumber: 2,
                    type: 'delete',
                  },
                  {
                    content: ' return []; ',
                    isInsert: true,
                    lineNumber: 2,
                    type: 'insert',
                  },
                  {
                    content: '}',
                    isNormal: true,
                    newLineNumber: 3,
                    oldLineNumber: 3,
                    type: 'normal',
                  },
                ],
              },
            ],
          },
          marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
          content: [
            {
              type: 'text',
              text: 'function getDocuments(req: Req) {\n return []; \n}',
            },
          ],
        },
      ])
    );
  });
});
