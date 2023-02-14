import { BoldOutlined, ItalicOutlined } from '@ant-design/icons';
import { Bold } from '@tiptap/extension-bold';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { History } from '@tiptap/extension-history';
import { Italic } from '@tiptap/extension-italic';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Text } from '@tiptap/extension-text';
import { BubbleMenu, useEditor, EditorContent } from '@tiptap/react';
import type { BlockLevelZero } from 'api/src/types/api';
import { useEffect } from 'react';

import cls from './index.module.scss';

export const Editor: React.FC<{
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ content, limit, minHeight, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak,
      Placeholder.configure({
        // Use a placeholder:
        placeholder: 'Write something …',
      }),
      History.configure({
        depth: 100,
      }),
      CharacterCount.configure({
        limit,
      }),
    ],
    onUpdate: (e) => {
      onUpdate(e.editor.getJSON() as any);
    },
    content,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    editor.commands.setContent(content);
  }, [content]);

  return (
    <div>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, arrow: true, placement: 'bottom' }}
          className={cls.floatingMenu}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? cls.isActive : ''}
          >
            <BoldOutlined />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? cls.isActive : ''}
          >
            <ItalicOutlined />
          </button>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className={cls.editor}
        style={{ minHeight }}
      />
    </div>
  );
};
