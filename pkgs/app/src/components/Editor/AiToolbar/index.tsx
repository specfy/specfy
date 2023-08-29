import { IconWand, IconRefresh, IconSparkles } from '@tabler/icons-react';
import type { Editor } from '@tiptap/react';
import { generateJSON } from '@tiptap/react';
import classNames from 'classnames';
import type React from 'react';
import { useState, useCallback, useEffect } from 'react';

import { aiOperation, aiStream } from '../../../api/ai';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import * as Dropdown from '../../Dropdown';
import { Button } from '../../Form/Button';
import { TooltipFull } from '../../Tooltip';

import { i18n } from '@/common/i18n';

// import cls from './index.module.scss';

export interface AIToolbarProps {
  className?: string;
  editor: Editor | null;
  tools?: Array<'project.description' | 'rewrite'>;
  onStart: () => void;
  onEnd: (success: boolean) => void;
}
export const AIToolbar: React.FC<AIToolbarProps> = ({
  className,
  editor,
  tools = ['rewrite'],
  onStart,
  onEnd,
}) => {
  const { ctx } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState('');

  const op = useCallback(async (data: Parameters<typeof aiOperation>[0]) => {
    setLoading(true);
    setRewriting('');
    onStart();
    const res = await aiOperation(data);
    if (!res.ok) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      onEnd(false);
      setLoading(false);
      return;
    }

    editor?.chain().focus().setContent('', true).run();
    aiStream({
      res,
      onAppend: (chunk) => {
        setRewriting((prev) => `${prev}${chunk.replace(/\n/g, '<br />')}`);
      },
      onFinish: () => {
        setLoading(false);

        // We manually send an update at the end to avoid triggering Staging to often
        setTimeout(() => {
          onEnd(true);
        }, 100);
      },
    });
  }, []);

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

  const onGenerate = () => {
    void op({
      orgId: ctx.orgId!,
      projectId: ctx.projectId,
      operation: { type: 'project.description' },
    });
  };
  const onRewrite = async () => {
    const text = editor!.getText()!;
    void op({
      orgId: ctx.orgId!,
      projectId: ctx.projectId,
      operation: { type: 'rewrite', text },
    });
  };

  return (
    <div className={classNames(className)}>
      <Dropdown.Menu>
        <Dropdown.Trigger asChild>
          <Button loading={loading} size="s">
            <IconWand /> AI
          </Button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content>
            <Dropdown.Group>
              {tools.includes('project.description') && (
                <TooltipFull
                  msg="Describe the project from all the information Specfy have."
                  side="right"
                >
                  <Dropdown.Item onClick={onGenerate}>
                    <IconRefresh />
                    Generate
                  </Dropdown.Item>
                </TooltipFull>
              )}
              {tools.includes('rewrite') && (
                <TooltipFull
                  msg="Improve the formulation, nothing will be added or deleted."
                  side="right"
                >
                  <Dropdown.Item onClick={onRewrite}>
                    <IconSparkles /> Rewrite
                  </Dropdown.Item>
                </TooltipFull>
              )}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Menu>
    </div>
  );
};
