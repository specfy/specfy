import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useListProjects } from '../../../api';
import { useGetFlow } from '../../../api/flows';
import { useProjectStore } from '../../../common/store';
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
  const storeProjects = useProjectStore();
  const res = useListProjects({ org_id: params.org_id });
  const resFlow = useGetFlow({ org_id: params.org_id });
  const [flow, setFlow] = useState<ComputedFlow>();

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    setFlow(resFlow.data?.data.flow);
  }, [resFlow]);

  if (res.isLoading) {
    return (
      <Container.Left>
        <Card padded>
          <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
        </Card>
      </Container.Left>
    );
  }

  return (
    <>
      <Helmet title={`${org.name} ${titleSuffix}`} />
      <Container.Left2Third>
        <OrgOnboarding org={org} key={org.id} />
        <Card large seamless>
          <ListProjects orgId={params.org_id}></ListProjects>
        </Card>
      </Container.Left2Third>
      <Container.Right1Third>
        {storeProjects.projects.length > 0 && (
          <div>
            {!flow ? (
              <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
            ) : (
              <FlowWrapper>
                <Flow flow={flow} readonly />
                <Toolbar position="bottom">
                  <Toolbar.Zoom />
                </Toolbar>
              </FlowWrapper>
            )}
          </div>
        )}

        <Card large seamless transparent>
          <ListActivity orgId={params.org_id}></ListActivity>
        </Card>
      </Container.Right1Third>
    </>
  );
};
