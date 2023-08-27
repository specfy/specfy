import { IconArrowLeft } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Link, useParams } from 'react-router-dom';

import { aiOperation, aiStream } from '../../../../api/ai';
import type { AICompletion } from '../../../../common/db';
import { db } from '../../../../common/db';
import { i18n } from '../../../../common/i18n';
import { useProjectStore } from '../../../../common/store';
import { CopyButton } from '../../../../components/Button/Copy';
import { Presentation } from '../../../../components/Content';
import { Flex } from '../../../../components/Flex';
import { Button } from '../../../../components/Form/Button';
import { Loading } from '../../../../components/Loading';
import { Subdued } from '../../../../components/Text';
import { useToast } from '../../../../hooks/useToast';

import cls from './index.module.scss';

export const ProjectAssistantShow: React.FC = () => {
  const toast = useToast();
  const params = useParams();

  const { project } = useProjectStore();

  const [loading, setLoading] = useState(true);
  const textRef = useRef<string>();
  const [op, setOp] = useState<AICompletion>();
  const [md, setMd] = useState<string>('');
  const scrollTo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (!params.operationId) {
        return;
      }

      const item = await db.aiCompletion.get(Number(params.operationId));
      if (
        !item ||
        item.orgId !== project?.orgId ||
        item.projectId !== project.id
      ) {
        return;
      }
      setOp(item);
    })();
  }, [params]);

  const stream = useCallback(
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
          db.aiCompletion.update(opId, {
            content: textRef.current,
          });
        },
      });
    },
    []
  );

  useEffect(() => {
    if (!op) {
      return;
    }
    if (op.startedAt || op.content) {
      setMd(op.content);
      setLoading(false);
      return;
    }

    void db.aiCompletion.update(Number(params.operationId), {
      startedAt: new Date().toISOString(),
    });
    void stream(Number(params.operationId), {
      orgId: project!.orgId,
      projectId: project!.id,
      operation: { type: 'project.onboarding' },
    });
  }, [op]);

  useEffect(() => {
    if (!loading || !scrollTo.current) {
      return;
    }

    scrollTo.current.scrollIntoView({ behavior: 'smooth' });
  }, [loading, md]);

  return (
    <div className={cls.operation}>
      <Flex justify="space-between">
        <Link to={'../'}>
          <Button display="ghost" className={cls.back}>
            <IconArrowLeft /> Go back to suggestions
          </Button>
        </Link>

        {loading ? (
          <Loading />
        ) : (
          <span>
            <CopyButton value={md}>Copy markdown</CopyButton>
          </span>
        )}
      </Flex>

      <Presentation size="l">
        {!op && <Subdued>Not found...</Subdued>}
        <ReactMarkdown>{md || 'No content...'}</ReactMarkdown>
      </Presentation>
      <div id="scrollTo" ref={scrollTo}></div>
    </div>
  );
};
