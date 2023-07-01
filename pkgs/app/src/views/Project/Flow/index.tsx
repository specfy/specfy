import { LoadingOutlined } from '@ant-design/icons';
import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiProject, ApiComponent } from '@specfy/api/src/types/api';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import type { OnConnect, OnEdgesChange, OnNodesChange } from 'reactflow';

import { useComponentsStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { FlowEdit } from './Edit';
import cls from './index.module.scss';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const { isEditing } = useEdit();
  const storeComponents = useComponentsStore();
  const [flow, setFlow] = useState<ComputedFlow>();

  const [loading, setLoading] = useState<boolean>(true);
  const [components, setComponents] = useState<ApiComponent[]>();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    setFlow(componentsToFlow(components));
    setLoading(false);
  }, [components]);

  // ---- Event Handlers
  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          storeComponents.remove(change.id);
        } else if (change.type === 'position') {
          if (change.position) {
            const comp = storeComponents.select(change.id)!;
            storeComponents.updateField(change.id, 'display', {
              ...comp.display,
              pos: change.position,
            });
          }
        }
      }
    },
    [components]
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          const [source, target] = change.id.split('->');
          storeComponents.removeEdge(source, target);
        }
      }
    },
    [components]
  );

  const onConnect = useCallback<OnConnect>((params) => {
    storeComponents.addEdge(params);
  }, []);

  const onRelationChange: React.ComponentProps<
    typeof FlowEdit
  >['onRelationChange'] = useCallback((type, rel) => {
    if (type === 'update') {
      storeComponents.updateEdge(rel.edge.source, rel.edge.target, {
        write: rel.edge.data!.write,
        read: rel.edge.data!.read,
      });
    }
  }, []);

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${proj.name} ${titleSuffix}`} />

      <FlowEdit
        components={components!}
        proj={proj}
        readonly={!isEditing}
        onNodesChange={onNodesChange}
        onRelationChange={onRelationChange}
      />
      {flow && (
        <>
          <FlowWrapper>
            <Flow
              readonly={!isEditing}
              flow={flow}
              downlightOther={false}
              keepHighlightOnSelect={true}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            />
            <Toolbar position="top" visible>
              <Toolbar.Readonly visible={!isEditing} />
              <Toolbar.Main />
            </Toolbar>
            <Toolbar position="bottom" visible>
              <Toolbar.Zoom />
              {/* <Toolbar.History /> */}
            </Toolbar>
          </FlowWrapper>
        </>
      )}
    </div>
  );
};
