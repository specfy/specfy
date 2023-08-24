import type { BlockLevelZero } from '@specfy/models';
import { IconWand } from '@tabler/icons-react';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEditor, EditorContent } from '@tiptap/react';
import classNames from 'classnames';
import type React from 'react';
import { useMemo, useEffect, useState } from 'react';

import { aiOperation } from '../../api/ai';
import { isError } from '../../api/helpers';
import { removeEmptyContent } from '../../common/content';
import { i18n } from '../../common/i18n';
import { useToast } from '../../hooks/useToast';
import { Button } from '../Form/Button';
import { TooltipFull } from '../Tooltip';

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
  const toast = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [animate, setAnimate] = useState<boolean>(false);
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

  const onRewrite = async () => {
    setAiLoading(true);
    const text = editor!.getText()!;
    const res = await aiOperation({ orgId: 'acme', type: 'rewrite', text });
    setAiLoading(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    editor!.commands.setContent(
      `<p>${res.data.text
        .replace('\n\n', '\n')
        .split('\n')
        .join('</p><p>')}</p>`
    );
    setAnimate(true);
    setTimeout(() => {
      onUpdate(removeEmptyContent(editor!.getJSON() as any));
    }, 100);
  };

  return (
    <div
      className={classNames(
        cls.wrapper,
        (aiLoading || animate) && cls.showToolbar
      )}
    >
      {editor && <BubbleMenu editor={editor} />}
      <div className={cls.toolbar}>
        <TooltipFull msg="Rewrite content with AI">
          <Button onClick={onRewrite} loading={aiLoading} size="s">
            <IconWand /> Rewrite
          </Button>
        </TooltipFull>
      </div>
      <div
        className={classNames(
          cls.animWrapper,
          aiLoading && cls.loading,
          animate && cls.finish
        )}
        onAnimationEnd={() => setAnimate(false)}
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
