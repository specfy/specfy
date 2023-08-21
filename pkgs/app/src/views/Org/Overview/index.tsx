import type { ComputedFlow, ApiOrg } from '@specfy/models';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { useLocalStorage } from 'react-use';

import { useListProjects, useGetFlow } from '../../../api';
import { titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { ListActivity } from '../../../components/ListActivity';
import { ListProjects } from '../../../components/ListProjects';
import { OrgOnboarding } from '../../../components/Org/Onboarding';
import type { RouteOrg } from '../../../types/routes';

export const OrgOverview: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const res = useListProjects({ org_id: params.org_id });
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const [flow, setFlow] = useState<ComputedFlow>();
  const [done] = useLocalStorage(`orgOnboarding-${org.id}`, false);

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    setFlow(resFlow.data.data.flow);
  }, [resFlow]);

  if (res.isLoading) {
    return null;
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
            {!flow ? (
              <div style={{ margin: '20px' }}>
                <Skeleton count={3} />
              </div>
            ) : (
              <Flow flow={flow} readonly />
            )}
            <Toolbar bottom>
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
