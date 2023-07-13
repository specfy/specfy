import type { ApiJob, ApiProject } from '@specfy/api/src/types/api';
import { Skeleton } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useGetDeploy } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { AvatarAuto } from '../../../../components/AvatarAuto';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { StatusTag } from '../../../../components/Job/StatusTag';
import { NotFound } from '../../../../components/NotFound';
import { Time } from '../../../../components/Time';
import type { RouteJob, RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

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

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setDeploy(res.data.data);
  }, [res]);

  const logs = useMemo(() => {
    const tmp: string[] = [];
    if (!deploy) {
      return tmp;
    }

    tmp.push(`Job created`);
    tmp.push('Configuration:');
    tmp.push(JSON.stringify(deploy.config));
    if (deploy.startedAt) {
      tmp.push('');
      tmp.push(`Starting...`);
    }
    if (deploy.finishedAt) {
      tmp.push(deploy.status);
      if (deploy.reason) {
        tmp.push(`Code: ${deploy.reason.code}`);
        tmp.push(`Reason: ${deploy.reason.reason}`);
      }
    }
    return tmp;
  }, [deploy]);

  // --------- Content
  if (res.isLoading && !deploy) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  if (!deploy) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Container.Left2Third>
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
              <AvatarAuto
                name={deploy.user.name}
                colored={false}
                size="small"
              />
              {deploy.user.name}
            </Flex>
          </div>
        </Flex>
        <PrismAsyncLight
          language="bash"
          style={prism}
          wrapLines={true}
          showLineNumbers={true}
          className={cls.logs}
        >
          {logs.join('\r\n')}
        </PrismAsyncLight>
      </Container.Left2Third>
    </Container>
  );
};
