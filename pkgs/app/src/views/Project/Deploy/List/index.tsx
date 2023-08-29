import type { ApiProject, ListJobs } from '@specfy/models';
import { IconChevronRight, IconCloudUpload } from '@tabler/icons-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { createJob, useListDeploys } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { i18n } from '../../../../common/i18n';
import { titleSuffix } from '../../../../common/string';
import { AvatarAuto } from '../../../../components/AvatarAuto';
import { Container } from '../../../../components/Container';
import { Empty } from '../../../../components/Empty';
import { Flex } from '../../../../components/Flex';
import { Button } from '../../../../components/Form/Button';
import { StatusTag } from '../../../../components/Job/StatusTag';
import { Time } from '../../../../components/Time';
import { TooltipFull } from '../../../../components/Tooltip';
import { useToast } from '../../../../hooks/useToast';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

const Row: React.FC<{
  deploy: ListJobs['Success']['data'][0];
  params: RouteProject;
}> = ({ deploy, params }) => {
  const link = `/${params.org_id}/${params.project_slug}/deploys/${deploy.id}`;

  return (
    <Flex className={cls.row} justify="space-between" align="center">
      <div>
        <Flex align="center" gap="l">
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
            <AvatarAuto user={deploy.user} size="s" />
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
  const toast = useToast();

  const [list, setList] = useState<ListJobs['Success']>();
  const [loadingNew, setLoadingNew] = useState<boolean>(false);

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

  const onNewDeploy = async () => {
    setLoadingNew(true);
    const create = await createJob({
      orgId: proj.orgId,
      projectId: proj.id,
      type: 'deploy',
    });
    setLoadingNew(false);
    if (isError(create)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Job triggered', status: 'success' });
  };

  return (
    <Container noPadding>
      <Container.Left2Third>
        <Helmet title={`Deploys - ${proj.name} ${titleSuffix}`} />
        <Flex className={cls.header} justify="space-between">
          <h2>Deploys</h2>
          <div>
            <TooltipFull
              msg={
                !proj.githubRepository
                  ? 'Project is not linked to any Github repository'
                  : ''
              }
              side="bottom"
              size="s"
            >
              <Button
                onClick={onNewDeploy}
                display="primary"
                loading={loadingNew}
                size="s"
                disabled={!proj.githubRepository}
              >
                <IconCloudUpload /> Trigger deploy
              </Button>
            </TooltipFull>
          </div>
        </Flex>

        {!list && (
          <div className={cls.list}>
            {[1, 2, 3].map((i) => {
              return (
                <Flex
                  key={i}
                  className={cls.row}
                  justify="space-between"
                  align="center"
                >
                  <Skeleton width={200} />
                </Flex>
              );
            })}
          </div>
        )}

        {list && (
          <div className={cls.list}>
            {list.data.map((deploy) => {
              return <Row deploy={deploy} params={params} key={deploy.id} />;
            })}
          </div>
        )}

        {list && list.data.length <= 0 && <Empty />}
      </Container.Left2Third>
    </Container>
  );
};
