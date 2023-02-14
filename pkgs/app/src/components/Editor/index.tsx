import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { BulletList } from '@tiptap/extension-bullet-list';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Document } from '@tiptap/extension-document';
import { FloatingMenu as FloatingMenuC } from '@tiptap/extension-floating-menu';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Text } from '@tiptap/extension-text';
import { useEditor, EditorContent } from '@tiptap/react';
import type { BlockLevelZero } from 'api/src/types/api';
import { useEffect } from 'react';

import { BubbleMenu } from './BubbleMenu';
import { FloatingMenu } from './FloatingMenu';
import { removeEmptyContent } from './helpers';
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
      Heading,
      BulletList,
      ListItem,
      Blockquote,
      FloatingMenuC,
      HorizontalRule,
      Link.configure({
        linkOnPaste: true,
        openOnClick: false,
      }),
      Placeholder.configure({
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
      {editor && <FloatingMenu editor={editor} />}
      <EditorContent
        editor={editor}
        className={cls.editor}
        style={{ minHeight }}
      />
    </div>
  );
};
