import type { BlockLevelZero } from '@specfy/models';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEditor, EditorContent } from '@tiptap/react';
import classNames from 'classnames';
import type React from 'react';
import { useMemo, useEffect, useState } from 'react';

import { removeEmptyContent } from '../../../common/content';
import { AIToolbar } from '../AiToolbar';
import { createMiniEditorSchema } from '../extensions';
import { BubbleMenu } from '../extensions/CustomBubbleMenu/BubbleMenu';

import cls from './index.module.scss';

const schema = createMiniEditorSchema();

const Editor: React.FC<{
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ content, limit, minHeight, onUpdate }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [finalAnimation, setFinalAnimation] = useState<boolean>(false);
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
    editable: !aiLoading,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    editor.commands.setContent(content);
  }, [content]);

  return (
    <div
      className={classNames(
        cls.wrapper,
        (aiLoading || finalAnimation) && cls.showToolbar
      )}
    >
      {editor && <BubbleMenu editor={editor} />}
      <AIToolbar
        className={cls.toolbar}
        editor={editor}
        onStart={() => setAiLoading(true)}
        onEnd={() => {
          setAiLoading(false);
          setFinalAnimation(true);
        }}
      />
      <div
        className={classNames(
          cls.animWrapper,
          aiLoading && cls.loading,
          finalAnimation && cls.finish
        )}
        onAnimationEnd={() => setFinalAnimation(false)}
      >
        <EditorContent
          editor={editor}
          className={cls.editor}
          style={{ minHeight }}
          readOnly={aiLoading}
        />
      </div>
    </div>
  );
};

/**
 * It is wrapped to avoid re-render on each key stroke.
 * There might be a better solution.
 */
export const EditorMini: React.FC<{
  doc: BlockLevelZero;
  onUpdate: (content: BlockLevelZero) => void;
}> = ({ doc, onUpdate }) => {
  const content = useMemo(() => {
    return doc;
  }, []);

  return (
    <div className={cls.mini}>
      <Editor content={content} onUpdate={onUpdate} />
    </div>
  );
};
