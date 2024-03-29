import { getApiBlobComponent } from '@specfy/models/src/components/test.utils';
import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { createEditorSchema } from '@/components/Editor/extensions';

import { diffComponent } from './diffComponent';

const editor = new Editor(createEditorSchema());

describe('diffComponent', () => {
  it('should find no diff when deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.deleted = true;
    const diff = diffComponent(editor, a);
    expect(diff).toStrictEqual([]);
  });

  it('should find no diff when nothing has changed', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    const diff = diffComponent(editor, a);
    expect(diff).toStrictEqual([]);
  });
});

describe('edges', () => {
  it('should find diff added', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.edges.push({
      source: 'a',
      target: 'b',
      portSource: 'sb',
      portTarget: 'tb',
      read: true,
      write: true,
      vertices: [],
    });
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'edges',
      diff: {
        added: [{ source: 'a' }],
        deleted: [],
        changes: 1,
      },
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.edges.push({
      source: 'a',
      target: 'b',
      portSource: 'sb',
      portTarget: 'tb',
      read: true,
      write: true,
      vertices: [],
    });
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'edges',
      diff: {
        added: [],
        deleted: [{ source: 'a' }],
        changes: 1,
      },
    });
  });

  it('should find diff modified', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.current!.edges.push({
      source: 'a',
      target: 'b',
      portSource: 'sb',
      portTarget: 'tb',
      read: true,
      write: true,
      vertices: [],
    });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.edges[0].show = false;
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'edges',
      diff: {
        added: [],
        deleted: [],
        modified: [{ source: 'a' }],
        changes: 1,
      },
    });
  });
});

describe('description', () => {
  it('should find diff', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.description = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [], attrs: { uid: 'a' } }],
    };
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'description',
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

describe('techs', () => {
  it('should find diff added', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.techs.push({ id: 'algolia' });
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'techs',
      diff: {
        added: [{ id: 'algolia' }],
        deleted: [],
        changes: 1,
      },
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.techs.push({ id: 'algolia' });
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'techs',
      diff: {
        added: [],
        deleted: [{ id: 'algolia' }],
        changes: 1,
      },
    });
  });
});

describe('tags', () => {
  it('should find diff added', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.tags = ['a', 'b'];
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'tags',
      diff: { added: ['a', 'b'], changes: 2 },
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.tags = ['a', 'b'];
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'tags',
      diff: { deleted: ['a', 'b'], changes: 2 },
    });
  });
  it('should find partial diff', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.current.tags = ['a', 'b'];
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.tags = ['c', 'a'];
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'tags',
      diff: { added: ['b'], deleted: ['c'], unchanged: ['a'], changes: 2 },
    });
  });
});

describe('display', () => {
  it('should find nested diff', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.display.pos.x = 290;
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'display',
      diff: [
        {
          count: 2,
          value: `{
  "pos": {
`,
        },
        {
          added: undefined,
          count: 1,
          removed: true,
          value: `    "x": 0,
`,
        },
        {
          added: true,
          count: 1,
          removed: undefined,
          value: `    "x": 290,
`,
        },
        {
          count: 8,
          value: `    "y": 0
  },
  "size": {
    "height": 40,
    "width": 130
  },
  "zIndex": 1
}`,
        },
      ],
    });
  });
});

describe('inComponent', () => {
  it('should find diff added', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.inComponent = { id: 'b' };
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'inComponent',
      diff: 'modified',
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.inComponent = { id: 'b' };
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'inComponent',
      diff: 'modified',
    });
  });
});

describe('show', () => {
  it('should find diff from undefined to something', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.show = false;
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'show',
      diff: 'modified',
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.show = false;
    a.current!.show = true;
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'show',
      diff: 'modified',
    });
  });
});

describe('name', () => {
  it('should find diff', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.name = 'hello';
    const diff = diffComponent(editor, a);
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

describe('techId', () => {
  it('should find diff added', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.techId = 'algolia';
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'techId',
      diff: 'modified',
    });
  });

  it('should find diff remove', () => {
    const a = getApiBlobComponent({ id: 'a', orgId: 'b' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.techId = 'algolia';
    const diff = diffComponent(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'techId',
      diff: 'modified',
    });
  });
});
