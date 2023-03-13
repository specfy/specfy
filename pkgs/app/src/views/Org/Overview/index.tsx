import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';

import { useListProjects } from '../../../api/projects';
import { useProjectsStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import type { ComponentForGraph } from '../../../components/Graph/helpers';
import { ListActivity } from '../../../components/ListActivity';
import { ListProjects } from '../../../components/ListProjects';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgOverview: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const storeProjects = useProjectsStore();
  const res = useListProjects({ org_id: params.org_id });
  const [components, setComponents] = useState<ComponentForGraph[]>();

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
  }, [res.isLoading]);

  if (res.isLoading || !components) {
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
          <ListProjects></ListProjects>
        </Card>
      </Container.Left>
      <Container.Right>
        <Card>
          <GraphContainer style={{ minHeight: '300px' }}>
            <Graph readonly={true} components={components} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>
        <ListActivity orgId={params.org_id}></ListActivity>
      </Container.Right>
    </>
  );
};
