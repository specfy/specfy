import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';
import classNames from 'classnames';
import { useMemo, useEffect, useState, useCallback } from 'react';

import type { BlockLevelZero } from '@specfy/models';

import { AIToolbar } from '../AiToolbar';
import { createMiniEditorSchema } from '../extensions';
import { BubbleMenu } from '../extensions/CustomBubbleMenu/BubbleMenu';
import { removeEmptyContent } from '@/common/content';

import cls from './index.module.scss';

import type { AIToolbarProps } from '../AiToolbar';
import type React from 'react';

const schema = createMiniEditorSchema();

export interface MiniEditorProps {
  content: BlockLevelZero;
  minHeight?: string;
  limit?: number;
  aiTools?: AIToolbarProps['tools'];
  placeholder?: string;
  onUpdate: (content: BlockLevelZero) => void;
}
const Editor: React.FC<MiniEditorProps> = ({
  content,
  limit,
  minHeight,
  aiTools,
  placeholder,
  onUpdate,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const [finalAnimation, setFinalAnimation] = useState<boolean>(false);
  const editor = useEditor({
    extensions: [
      ...schema.extensions,
      CharacterCount.configure({
        limit,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something …',
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
  const onEnd = useCallback(() => {
    setAiLoading(false);
    setFinalAnimation(true);
    onUpdate(removeEmptyContent(editor!.getJSON() as any));
  }, [editor]);

  return (
    <div
      className={classNames(
        cls.wrapper,
        (aiLoading || finalAnimation || focus) && cls.showToolbar
      )}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      {editor && <BubbleMenu editor={editor} />}
      <AIToolbar
        className={cls.toolbar}
        editor={editor}
        tools={aiTools}
        onStart={() => setAiLoading(true)}
        onEnd={onEnd}
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
        />
      </div>
    </div>
  );
};

/**
 * It is wrapped to avoid re-render on each key stroke.
 * There might be a better solution.
 */
export const EditorMini: React.FC<
  {
    doc: BlockLevelZero;
    className?: string;
  } & Omit<MiniEditorProps, 'content'>
> = ({ doc, className, ...props }) => {
  const content = useMemo(() => {
    return doc;
  }, []);

  return (
    <div className={classNames(cls.mini, className)}>
      <Editor content={content} {...props} />
    </div>
  );
};
