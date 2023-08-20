import Editor from '@monaco-editor/react';
import type { ApiJob, ApiProject } from '@specfy/models';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { useGetDeploy } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { AvatarAuto } from '../../../../components/AvatarAuto';
import { Banner } from '../../../../components/Banner';
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
    tmp.push(`Created ["${deploy.createdAt}"]`);
    tmp.push(`Job [id: "${deploy.id}"]`);
    tmp.push(`Org [id: "${deploy.orgId}"]`);
    tmp.push(`Project [id: "${deploy.projectId}"]`);
    tmp.push('Configuration =>');
    tmp.push(JSON.stringify(deploy.config, null, 2));
    if (deploy.startedAt) {
      tmp.push(`Processing ["${deploy.startedAt}"]`);
    }
    if (deploy.finishedAt) {
      if (deploy.reason && deploy.status !== 'success') {
        tmp.push(
          `Error [code: "${deploy.reason.code}"] ${deploy.reason.reason}`
        );
        tmp.push(deploy.reason.err!);
      }
      tmp.push(`Status ["${deploy.status}"]`);

      tmp.push(`Finished ["${deploy.finishedAt}"]  `);
    }
    return tmp;
  }, [deploy]);

  // --------- Content
  if (res.isLoading && !deploy) {
    return (
      <Container noPadding>
        <Container.Left2Third>
          <div className={cls.header}>
            <Skeleton width={150} height={40} />
          </div>

          <Flex gap="l" className={cls.states}>
            <Skeleton width={350} count={3} />
          </Flex>
        </Container.Left2Third>
      </Container>
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
              <AvatarAuto user={deploy.user} size="s" />
              {deploy.user.name}
            </Flex>
          </div>
        </Flex>
        {deploy.status === 'failed' && deploy.reason && (
          <div className={cls.header}>
            <Banner type="error">
              {deploy.reason.reason} (code: {deploy.reason.code})
            </Banner>
          </div>
        )}
        <Editor
          className={cls.logs}
          height={`${logs.length * 34}px`}
          defaultLanguage="json"
          value={logs.join('\r\n')}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            // lineNumbers: 'off',
            fontSize: 14,
            // wordWrap: 'on',
          }}
        />
      </Container.Left2Third>
    </Container>
  );
};
