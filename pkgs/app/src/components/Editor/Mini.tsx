import type { BlockLevelZero } from '@specfy/api/src/types/api';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEditor, EditorContent } from '@tiptap/react';
import type React from 'react';
import { useMemo, useEffect } from 'react';

import { removeEmptyContent } from '../../common/content';

import { createMiniEditorSchema } from './extensions';
import { BubbleMenu } from './extensions/CustomBubbleMenu/BubbleMenu';
import cls from './mini.module.scss';

const schema = createMiniEditorSchema();

const Editor: React.FC<{
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ content, limit, minHeight, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      ...schema.extensions,
      CharacterCount.configure({
        limit,
      }),
    ],

    onUpdate: (e) => {
      onUpdate(removeEmptyContent(e.editor.getJSON() as any));
    },
    content:
      content.content.length === 0
        ? {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          }
        : content,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    editor.commands.setContent(content);
  }, [content]);

  return (
    <div>
      {editor && <BubbleMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className={cls.editor}
        style={{ minHeight }}
      />
    </div>
  );
};

export const EditorMini: React.FC<{
  doc: BlockLevelZero;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ doc, onUpdate }) => {
  // To prevent rerender
  const content = useMemo(() => {
    return doc;
  }, []);

  return (
    <div className={cls.mini}>
      <Editor content={content} onUpdate={onUpdate} />
    </div>
  );
};
