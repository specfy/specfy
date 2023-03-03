import { LoadingOutlined } from '@ant-design/icons';
import type { ApiProject, ApiComponent } from 'api/src/types/api';
import { useState } from 'react';
import { useMount } from 'react-use';

import { Card } from '../../../components/Card';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import type { TmpBlobComponent } from '../../../hooks/useEdit';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { GraphEdit } from './Edit';

export const ProjectGraph: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps }) => {
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const [components, setComponents] = useState(() => comps);
  const [loading, setLoading] = useState<boolean>(true);

  useMount(() => {
    const tmp: ApiComponent[] = [];
    for (const comp of components) {
      const modified = edit.changes.find<TmpBlobComponent>(
        (c): c is TmpBlobComponent =>
          c.typeId === comp.id && c.type === 'component'
      );
      if (!modified || Object.keys(modified.blob).length <= 0) {
        tmp.push(comp);
        continue;
      }

      tmp.push({
        ...comp,
        ...modified.blob,
        display: {
          ...comp.display,
          pos: {
            ...(modified.blob.display || comp.display).pos,
          },
        },
        edges: modified.blob.edges || comp.edges,
      });
    }

    setComponents(tmp);
    setLoading(false);
  });

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <div>
      <Card>
        <GraphEdit comps={components} proj={proj} />
        <GraphContainer>
          <div
            style={{
              width: 'calc(100vw - 24px * 2)',
              height: 'calc(100vh - 200px)',
            }}
          >
            <Graph
              components={components}
              readonly={!isEditing}
              toolbarFull={true}
            />
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
    </div>
  );
};