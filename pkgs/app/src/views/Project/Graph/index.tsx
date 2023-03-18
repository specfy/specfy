import { LoadingOutlined } from '@ant-design/icons';
import type { ApiProject, ApiComponent } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useComponentsStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { GraphEdit } from './Edit';

export const ProjectGraph: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const edit = useEdit();
  const storeComponents = useComponentsStore();

  const isEditing = edit.isEnabled();
  const [loading, setLoading] = useState<boolean>(true);
  const [components, setComponents] = useState<ApiComponent[]>();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    setLoading(false);
  }, [components]);

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <Container>
      <Card>
        <GraphEdit comps={components!} proj={proj} />
        <GraphContainer>
          <div
            style={{
              width: 'calc(100vw - 24px * 2)',
              height: 'calc(100vh - 200px)',
            }}
          >
            <Graph readonly={!isEditing} components={components!} memoize />
          </div>
          <Toolbar position="top" visible>
            <Toolbar.Main />
          </Toolbar>
          <Toolbar position="bottom" visible>
            <Toolbar.Zoom />
            <Toolbar.History />
          </Toolbar>
        </GraphContainer>
      </Card>
    </Container>
  );
};
