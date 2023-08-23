import { Form } from '@radix-ui/react-form';
import { IconMessageReport } from '@tabler/icons-react';
import { useState } from 'react';

import { createFeedback } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Flex } from '../Flex';
import { Button } from '../Form/Button';
import { Field } from '../Form/Field';
import { Textarea } from '../Form/TextArea';
import * as Popover from '../Popover';

import cls from './index.module.scss';

export const Feedback: React.FC = () => {
  const toast = useToast();
  const { currentPerm } = useAuth();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onOpenChange = (val: boolean) => {
    setOpen(val);
  };
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);

    await createFeedback({
      feedback: text,
      orgId: currentPerm!.orgId,
      referer: window.location.href,
    });

    setLoading(false);
    setOpen(false);
    setText('');
    toast.add({
      title:
        'Thanks for your feedback. We will keep you informed on further update.',
    });
  };

  return (
    <Popover.Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <Button size="s">
          <IconMessageReport /> Feedback
        </Button>
      </Popover.Trigger>
      <Popover.Content className={cls.form}>
        <Form onSubmit={onSubmit}>
          <Field name="feedback">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your technical issues or ideas on how to improve Specfy"
              size="s"
              className={cls.text}
            />
          </Field>
          <Flex justify="flex-end">
            <Button display="ghost" size="s" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" display="primary" loading={loading}>
              Send feedback
            </Button>
          </Flex>
        </Form>
      </Popover.Content>
    </Popover.Popover>
  );
};
