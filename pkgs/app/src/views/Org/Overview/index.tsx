import type { ApiOrg } from '@specfy/models';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useLocalStorage } from 'react-use';

import { useListProjects, useGetFlow } from '../../../api';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { ListActivity } from '../../../components/ListActivity';
import { ListProjects } from '../../../components/ListProjects';
import { OrgOnboarding } from '../../../components/Org/Onboarding';
import type { RouteOrg } from '../../../types/routes';

import { i18n } from '@/common/i18n';
import { useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { FlowV2 } from '@/components/Flow/FlowV2';

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

    store.setCurrent(resFlow.data.data.flow);
    store.setReadonly(true);
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
      <Container.Left2Third>
        {!done && <OrgOnboarding org={org} key={org.id} />}
        <ListProjects orgId={params.org_id}></ListProjects>
      </Container.Left2Third>
      <Container.Right1Third>
        <div>
          <FlowWrapper columnMode>
            {!resFlow.data ? (
              <div style={{ margin: '20px' }}>
                <Skeleton count={3} />
              </div>
            ) : (
              <FlowV2 />
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
      </Container.Right1Third>
    </>
  );
};
