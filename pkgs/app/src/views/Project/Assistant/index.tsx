import {
  IconArrowLeft,
  IconMessageDots,
  IconSparkles,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import { aiOperation, aiStream } from '../../../api/ai';
import { db } from '../../../common/db';
import { i18n } from '../../../common/i18n';
import { useProjectStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Container } from '../../../components/Container';
import { Presentation } from '../../../components/Content';
import { Flex } from '../../../components/Flex';
import { Button } from '../../../components/Form/Button';
import { Loading } from '../../../components/Loading';
import { Subdued } from '../../../components/Text';
import { Time } from '../../../components/Time';
import { useToast } from '../../../hooks/useToast';

import cls from './index.module.scss';

// const schema = createEditorSchema();

export const ProjectAssistant: React.FC = () => {
  const toast = useToast();
  const { project } = useProjectStore();
  const args = { orgId: project!.orgId, projectId: project!.id };
  const items = useLiveQuery(() =>
    db.aiCompletion.where(args).reverse().limit(15).toArray()
  );

  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<number | null>(null);
  const textRef = useRef<string>();
  const [md, setMd] = useState<string>('');

  const op = useCallback(
    async (opId: number, data: Parameters<typeof aiOperation>[0]) => {
      setLoading(true);
      setMd('');
      textRef.current = '';

      const res = await aiOperation(data);
      if (!res.ok) {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
        setLoading(false);
        return;
      }

      aiStream({
        res,
        onAppend: (chunk) => {
          textRef.current = textRef.current + chunk;
          setMd(textRef.current);
        },
        onFinish: () => {
          setLoading(false);
          console.log(opId, textRef.current);
          db.aiCompletion.update(opId, {
            content: textRef.current,
          });
        },
      });
    },
    []
  );

  const onClickHistory = async (oldId: number) => {
    const item = await db.aiCompletion.get(oldId);
    if (!item) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    setLoading(false);

    setId(oldId);
    setMd(item.content);
  };

  const onGetOnboarding = async () => {
    const index = await db.aiCompletion.add({
      ...args,
      title: 'Customized onboarding',
      content: '',
      createdAt: new Date().toISOString(),
    });
    setId(index as number);
    void op(index as number, {
      orgId: project!.orgId,
      projectId: project!.id,
      operation: { type: 'project.onboarding' },
    });
  };

  if (!project) {
    return null;
  }

  return (
    <Container noPadding>
      <Helmet title={`Assistant - ${project.name} ${titleSuffix}`} />
      <Container.Left2Third>
        <header className={cls.header}>
          <h1>
            <IconSparkles /> AI Assistant
          </h1>
        </header>
        <div className={cls.main}>
          {id && (
            <div key={id}>
              <Flex justify="space-between">
                <Button
                  display="ghost"
                  onClick={() => setId(null)}
                  className={cls.back}
                >
                  <IconArrowLeft /> Go back to suggestions
                </Button>

                {loading && <Loading />}
              </Flex>
              <Presentation>
                <ReactMarkdown>{md}</ReactMarkdown>
              </Presentation>
            </div>
          )}
          {!id && (
            <div className={cls.blocs}>
              <div className={cls.bloc} onClick={onGetOnboarding}>
                <h3>Onboarding</h3>
                <p>Get a customized onboarding</p>
              </div>
            </div>
          )}
        </div>

        {/* <div className={cls.input}>
          <Popover.Popover>
            <Popover.Trigger asChild>
              <button className={cls.button}>Ask anything</button>
            </Popover.Trigger>
            <Popover.Content
              style={{ width: '575px' }}
              align="start"
              sideOffset={4}
            >
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandEmpty>No result.</CommandEmpty>
                <CommandGroup>
                  <CommandItem>Start onboarding</CommandItem>
                  <CommandItem>
                    Give me infrastructure recommendation
                  </CommandItem>
                </CommandGroup>
              </Command>
            </Popover.Content>
          </Popover.Popover>
        </div> */}
      </Container.Left2Third>
      <Container.Right1Third>
        <div className={cls.sidebar} key={id}>
          <h4>History</h4>
          <div className={cls.list}>
            {items?.map((item) => {
              console.log(id, item.id);
              return (
                <div
                  key={item.id}
                  className={classNames(
                    cls.prev,
                    id === item.id && cls.current
                  )}
                  onClick={() => onClickHistory(item.id!)}
                >
                  <Button>
                    <IconMessageDots />
                    {item.title}
                  </Button>
                  <Subdued>
                    <Time time={item.createdAt} />
                  </Subdued>
                </div>
              );
            })}
          </div>
        </div>
      </Container.Right1Third>
    </Container>
  );
};
