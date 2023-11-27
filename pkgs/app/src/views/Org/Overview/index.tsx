import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useLocalStorage } from 'react-use';

import type { ApiOrg } from '@specfy/models';

import { useListProjects, useGetFlow } from '@/api';
import { i18n } from '@/common/i18n';
import { useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Toolbar } from '@/components/Flow/Toolbar';
import { FlowWrapper } from '@/components/Flow/Wrapper';
import { ListActivity } from '@/components/ListActivity';
import { OrgOnboarding } from '@/components/Org/Onboarding';
import { ProjectList } from '@/components/Project/List';
import type { RouteOrg } from '@/types/routes';

export const OrgOverview: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const store = useFlowStore();
  const res = useListProjects({ org_id: params.org_id });
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
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
