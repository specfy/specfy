import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import { useListProjects } from '../../../api';
import { useProjectStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { ComputedFlow } from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import type { ComponentForGraph } from '../../../components/Graph/helpers';
import { ListActivity } from '../../../components/ListActivity';
import { ListProjects } from '../../../components/ListProjects';
import type { RouteOrg } from '../../../types/routes';

export const OrgOverview: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const storeProjects = useProjectStore();
  const res = useListProjects({ org_id: params.org_id });
  const [components, setComponents] = useState<ComponentForGraph[]>([]);
  const [flow, setFlow] = useState<ComputedFlow>();

  useEffect(() => {
    if (!res.data?.data) {
      return;
    }

    storeProjects.fill(res.data.data);
    setComponents(
      res.data.data.map((project) => {
        return {
          id: project.id,
          name: project.name,
          type: 'project',
          display: project.display,
          edges: project.edges,
          inComponent: null,
        };
      })
    );
  }, [res.data]);

  useEffect(() => {
    if (components.length <= 0) {
      return;
    }

    setFlow(componentsToFlow(components));
  }, [components]);

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
      <Container.Left>
        <Card padded>
          <ListProjects orgId={params.org_id}></ListProjects>
        </Card>
      </Container.Left>
      <Container.Right>
        {storeProjects.projects.length > 0 && (
          <div>
            {/* <GraphContainer style={{ minHeight: '300px' }}>
              <Graph readonly={true} components={components} />
              <Toolbar position="bottom">
                <Toolbar.Zoom />
              </Toolbar>
            </GraphContainer> */}
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
        <ListActivity orgId={params.org_id}></ListActivity>
      </Container.Right>
    </>
  );
};
