import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import type { ApiOrg } from '@specfy/models';

import { useListProjects, useGetFlow, useCatalogSummary } from '@/api';
import { i18n } from '@/common/i18n';
import { useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Toolbar } from '@/components/Flow/Toolbar';
import { FlowWrapper } from '@/components/Flow/Wrapper';
import { Button } from '@/components/Form/Button';
import { ListActivity } from '@/components/ListActivity';
import { Metric } from '@/components/Metric';
import { OrgOnboarding } from '@/components/Org/Onboarding';
import { ProjectList } from '@/components/Project/List';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

export const OrgOverview: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const store = useFlowStore();
  const res = useListProjects({ org_id: params.org_id });
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const resSummary = useCatalogSummary({ org_id: params.org_id });
  const [done] = useLocalStorage(`org.onboarding[${org.id}]`, false);

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    store.setCurrent(org.flowId, resFlow.data.data.flow);
    store.setMeta({ readOnly: true, connectable: false, deletable: false });
  }, [resFlow.data]);

  if (res.error) {
    return <div>{i18n.criticalErrorOccurred}</div>;
  }
  if (res.isLoading) {
    return (
      <div style={{ width: '300px' }}>
        <Skeleton count={3} />
      </div>
    );
  }

  return (
    <>
      <Helmet title={`${org.name} ${titleSuffix}`} />
      <ContainerChild leftLarge>
        {!done && <OrgOnboarding org={org} key={org.id} />}
        <Flex className={cls.content} gap="xl" column align="flex-start">
          <Flex justify="space-between" grow>
            <h2>{org.name} overview</h2>
            <Link to={`/${params.org_id}/_/project/new`}>
              <Button display="primary">
                <IconPlus /> new project
              </Button>
            </Link>
          </Flex>
          <Flex gap="xl" grow>
            <Metric
              number={res.data?.pagination.totalItems || 0}
              label="projects"
              labelPos="down"
              className={cls.metric}
            />
            <Link to={`/${params.org_id}/_/catalog`} className={cls.metric}>
              <Metric
                number={resSummary.data?.data.count || 0}
                label="technologies"
                labelPos="down"
              />
            </Link>
          </Flex>
        </Flex>
        <ProjectList orgId={params.org_id}></ProjectList>
      </ContainerChild>
      <ContainerChild rightSmall>
        <div>
          <FlowWrapper columnMode>
            {!resFlow.data ? (
              <div style={{ margin: '20px' }}>
                <Skeleton count={3} />
              </div>
            ) : (
              <FlowOrg />
            )}
            <Toolbar bottom>
              <Toolbar.Fullscreen to={`${org.id}/_`} />
              <Toolbar.Zoom />
            </Toolbar>
          </FlowWrapper>
        </div>

        <Card large seamless transparent>
          <ListActivity orgId={params.org_id}></ListActivity>
        </Card>
      </ContainerChild>
    </>
  );
};
