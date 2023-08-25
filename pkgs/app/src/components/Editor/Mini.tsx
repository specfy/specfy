import type { BlockLevelZero } from '@specfy/models';
import { IconWand } from '@tabler/icons-react';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEditor, EditorContent, generateJSON } from '@tiptap/react';
import classNames from 'classnames';
import type React from 'react';
import { useMemo, useEffect, useState } from 'react';

import { aiOperation, aiStream } from '../../api/ai';
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
  const [rewriting, setRewriting] = useState('');
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
    editable: !aiLoading,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    editor.commands.setContent(content);
  }, [content]);

  useEffect(() => {
    if (!rewriting || !editor) {
      return;
    }

    editor!
      .chain()
      .focus()
      .setContent(
        generateJSON(rewriting, editor!.extensionManager.extensions),
        false
      )
      .scrollIntoView()
      .focus()
      .run();
  }, [rewriting]);

  const onRewrite = async () => {
    setAiLoading(true);
    const text = editor!.getText()!;
    const res = await aiOperation({ orgId: 'acme', type: 'rewrite', text });
    if (!res.ok) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    editor?.chain().focus().setContent('', true).run();
    aiStream({
      res,
      onAppend: (chunk) => {
        setRewriting((prev) => `${prev}${chunk}`);
      },
      onFinish: () => {
        setAnimate(true);
        setAiLoading(false);

        // We manually send an update at the end to avoid triggering Staging to often
        setTimeout(() => {
          onUpdate(removeEmptyContent(editor!.getJSON() as any));
        }, 100);
      },
    });
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
        <TooltipFull msg="Improve the style of content with AI. Nothing will be added or deleted.">
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
          readOnly={aiLoading}
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
