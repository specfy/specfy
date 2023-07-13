import type { ApiProject, ListJobs } from '@specfy/api/src/types/api';
import { IconChevronRight } from '@tabler/icons-react';
import { Skeleton } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { useListDeploys } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { AvatarAuto } from '../../../../components/AvatarAuto';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { StatusTag } from '../../../../components/Job/StatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

const Row: React.FC<{
  deploy: ListJobs['Success']['data'][0];
  params: RouteProject;
}> = ({ deploy, params }) => {
  const link = `/${params.org_id}/${params.project_slug}/deploys/${deploy.id}`;

  return (
    <Flex
      className={cls.row}
      justifyContent="space-between"
      alignItems="center"
    >
      <div>
        <Flex alignItems="center" gap="l">
          <div className={cls.title}>
            <Link to={link} relative="path">
              Deploy <span className={cls.typeId}>#{deploy.typeId}</span>
            </Link>
          </div>
        </Flex>
        <Flex className={cls.info} gap="m">
          {deploy.finishedAt ? (
            <Time time={deploy.finishedAt} />
          ) : (
            <Time time={deploy.startedAt || deploy.createdAt} />
          )}{' '}
          ·{' '}
          <Flex gap="m">
            <AvatarAuto name={deploy.user.name} colored={false} size="small" />
            {deploy.user.name}
          </Flex>
        </Flex>
      </div>
      <Flex gap="l">
        <StatusTag status={deploy.status} />

        <Link to={link} relative="path">
          <IconChevronRight />
        </Link>
      </Flex>
    </Flex>
  );
};

export const ProjectDeploysList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [list, setList] = useState<ListJobs['Success']>();

  const res = useListDeploys({
    org_id: params.org_id,
    project_id: proj.id,
  });

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setList(res.data);
  }, [res.dataUpdatedAt]);

  return (
    <Container noPadding>
      <Container.Left2Third>
        <Helmet title={`Deploys - ${proj.name} ${titleSuffix}`} />
        <div className={cls.header}>
          <h2>Deploys</h2>
        </div>

        {!list && <Skeleton active title={false} />}

        {list && (
          <div className={cls.list}>
            {list.data.map((deploy) => {
              return <Row deploy={deploy} params={params} key={deploy.id} />;
            })}
          </div>
        )}
      </Container.Left2Third>
    </Container>
  );
};