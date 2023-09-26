import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import type { ApiJob, ApiProject } from '@specfy/models';

import { Row } from '../../Revisions/List';
import { useGetDeploy, useGetRevision } from '@/api';
import { titleSuffix } from '@/common/string';
import { AvatarAuto } from '@/components/AvatarAuto';
import { Banner } from '@/components/Banner';
import { CodeHighlighter } from '@/components/CodeHighlighter';
import { Container, ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { StatusTag } from '@/components/Job/StatusTag';
import { NotFound } from '@/components/NotFound';
import { Subdued } from '@/components/Text';
import { Time } from '@/components/Time';
import type { RouteJob, RouteProject } from '@/types/routes';

import cls from './index.module.scss';

type LogLine = {
  level: 30;
  time: number;
  message: string;
  data: Record<string, any>;
};
const codeToLevel = {
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
};

export const ProjectDeploysShow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const more = useParams<Partial<RouteJob>>();
  const [deploy, setDeploy] = useState<ApiJob>();

  // --------- Data fetching
  const res = useGetDeploy({
    org_id: params.org_id,
    project_id: proj.id,
    job_id: more.job_id!,
  });
  const getRev = useGetRevision({
    org_id: params.org_id,
    project_id: proj.id,
    revision_id: deploy?.revisionId as string,
  });

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setDeploy(res.data.data);
  }, [res]);

  useEffect(() => {
    if (!deploy) {
      return;
    }

    let interval: any;
    if (!deploy?.finishedAt) {
      interval = setInterval(() => {
        res.refetch();
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const logs = useMemo(() => {
    if (!deploy) {
      return [];
    }

    const tmp: string[] = [];
    tmp.push(`Created: "${deploy.createdAt}"`);
    if (deploy.startedAt) {
      tmp.push(`Started: "${deploy.startedAt}"`);
    }

    const split = deploy.logs.split('\n');
    for (const l of split) {
      if (l === '') {
        continue;
      }
      try {
        const line: LogLine = JSON.parse(l);
        tmp.push(`${codeToLevel[line.level]} ${line.message}`);
        if (line.data && Object.keys(line.data).length > 0) {
          tmp.push(JSON.stringify(line.data, null, 2));
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (deploy.finishedAt) {
      tmp.push(`---`);
      tmp.push(`Finished: "${deploy.finishedAt}"`);
      tmp.push(`Status: "${deploy.status}"`);
      if (deploy.reason && deploy.status !== 'success') {
        tmp.push(`Code: "${deploy.reason.code}"`);
        tmp.push(`${deploy.reason.reason}`);
      }
    }
    return tmp;
  }, [deploy]);

  // --------- Content
  if (res.isLoading && !deploy) {
    return (
      <Container noPadding>
        <ContainerChild leftLarge>
          <div className={cls.header}>
            <Skeleton width={150} height={40} />
          </div>

          <Flex gap="l" className={cls.states}>
            <Skeleton width={350} count={3} />
          </Flex>
        </ContainerChild>
      </Container>
    );
  }

  if (!deploy) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <ContainerChild leftLarge>
        <Helmet title={`${deploy.type} - ${proj.name} ${titleSuffix}`} />
        <div className={cls.header}>
          <h2>
            Deploy <span>#{deploy.typeId}</span>
          </h2>
        </div>
        <Flex gap="l" className={cls.states}>
          <div className={cls.block}>
            <div className={cls.label}>Status</div>
            <StatusTag status={deploy.status} />
          </div>
          <div className={cls.block}>
            <div className={cls.label}>Started</div>
            {deploy.startedAt ? <Time time={deploy.startedAt} /> : '-'}
          </div>
          <div className={cls.block}>
            <div className={cls.label}>Source</div>
            <Flex gap="m">
              <AvatarAuto user={deploy.user} size="s" />
              {deploy.user.name}
            </Flex>
          </div>
        </Flex>
        <Flex gap="l" className={cls.states}>
          <div className={cls.block}>
            <div className={cls.label}>Revision</div>

            {getRev.data ? (
              <Row item={getRev.data.data} />
            ) : (
              <Subdued>No revision created</Subdued>
            )}
          </div>
        </Flex>
        {deploy.status === 'failed' && deploy.reason && (
          <div className={cls.banner}>
            <Banner type="error">
              {deploy.reason.reason} <br />
              (code: {deploy.reason.code})
            </Banner>
          </div>
        )}
        <div className={cls.logs}>
          <CodeHighlighter language="log" code={logs.join('\r\n')} />
        </div>
      </ContainerChild>
    </Container>
  );
};
