import { getApiBlobProject } from '@specfy/models/src/projects/test.utils';
import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';

import { diffProject } from './diffProject';

import { createEditorSchema } from '@/components/Editor/extensions';

const editor = new Editor(createEditorSchema());

describe('diffProject', () => {
  it('should find no diff when deleted', () => {
    const a = getApiBlobProject({ id: 'a' });
    a.deleted = true;
    const diff = diffProject(editor, a);
    expect(diff).toStrictEqual([]);
  });

  it('should find no diff when nothing has changed', () => {
    const a = getApiBlobProject({ id: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    const diff = diffProject(editor, a);
    expect(diff).toStrictEqual([]);
  });
});

describe('description', () => {
  it('should find diff', () => {
    const a = getApiBlobProject({ id: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.description = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [], attrs: { uid: 'a' } }],
    };
    const diff = diffProject(editor, a);
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

describe('links', () => {
  it('should find diff added', () => {
    const a = getApiBlobProject({ id: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.current.links.push({ title: 'GitHub', url: 'https://' });
    const diff = diffProject(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'links',
      diff: {
        added: [{ title: 'GitHub', url: 'https://' }],
        deleted: [],
        changes: 1,
      },
    });
  });

  it('should find diff deleted', () => {
    const a = getApiBlobProject({ id: 'a' });
    a.previous = JSON.parse(JSON.stringify(a.current));
    a.previous!.links.push({ title: 'GitHub', url: 'https://' });
    const diff = diffProject(editor, a);
    expect(diff).toHaveLength(1);
    expect(diff[0]).toMatchObject({
      key: 'links',
      diff: {
        added: [],
        deleted: [{ title: 'GitHub', url: 'https://' }],
        changes: 1,
      },
    });
  });
});
