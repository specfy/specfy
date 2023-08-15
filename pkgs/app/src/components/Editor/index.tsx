import type { BlockLevelZero } from '@specfy/models';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import { removeEmptyContent } from '../../common/content';
import { Presentation } from '../Content';

import { createEditorSchema } from './extensions';
import { BubbleMenu } from './extensions/CustomBubbleMenu/BubbleMenu';
import { FloatingMenu } from './extensions/CustomFloatingMenu/FloatingMenu';
import cls from './index.module.scss';

export interface Props {
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}

const schema = createEditorSchema();

export const Editor: React.FC<Props> = (props) => {
  const editor = useEditor({
    extensions: [
      ...schema.extensions,
      CharacterCount.configure({
        limit: props.limit,
      }),
    ],
    onUpdate: (p) => {
      props.onUpdate(removeEmptyContent(p.editor.getJSON() as BlockLevelZero));
    },
    content:
      props.content.content.length === 0
        ? {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          }
        : props.content,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    editor.commands.setContent(props.content);
  }, [props.content]);

  return (
    <div>
      {editor && <BubbleMenu editor={editor} />}
      {editor && <FloatingMenu editor={editor} />}
      <Presentation>
        <EditorContent
          editor={editor}
          className={cls.editor}
          style={{ minHeight: props.minHeight }}
        />
      </Presentation>
    </div>
  );
};
