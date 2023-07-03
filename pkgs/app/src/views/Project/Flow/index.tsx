import { LoadingOutlined } from '@ant-design/icons';
import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiProject, ApiComponent } from '@specfy/api/src/types/api';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import type { OnConnect, OnEdgesChange } from 'reactflow';

import { createLocal } from '../../../common/components';
import { useComponentsStore, useProjectStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { FlowDetails } from '../../../components/Flow/Details';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { OnNodesChangeSuper } from '../../../components/Flow/helpers';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const { isEditing } = useEdit();
  const storeComponents = useComponentsStore();
  const storeProjects = useProjectStore();
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
  const onNodesChange = useCallback<OnNodesChangeSuper>(
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
        } else if (change.type === 'group') {
          const comp = storeComponents.select(change.id)!;
          storeComponents.update({
            ...comp,
            inComponent: change.parentId,
            display: {
              ...comp.display,
              pos: change.position,
            },
          });
        } else if (change.type === 'ungroup') {
          storeComponents.updateField(change.id, 'inComponent', null);
        } else if (change.type === 'rename') {
          storeComponents.updateField(change.id, 'name', change.name);
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
    typeof FlowDetails
  >['onRelationChange'] = useCallback((type, rel) => {
    if (type === 'update') {
      storeComponents.updateEdge(rel.edge.source, rel.edge.target, {
        write: rel.edge.data!.write,
        read: rel.edge.data!.read,
      });
    }
  }, []);

  const onCreateNode: React.ComponentProps<typeof Flow>['onCreateNode'] = (
    type,
    position
  ) => {
    const id = createLocal(
      {
        name: 'untitled',
        slug: 'untitled',
        type,
        position,
      },
      storeProjects,
      storeComponents
    );

    return id;
  };

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${proj.name} ${titleSuffix}`} />

      <FlowDetails
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
              onCreateNode={onCreateNode}
            />
            {isEditing && (
              <Toolbar position="left" visible>
                <Toolbar.AddComponents />
              </Toolbar>
            )}
            <Toolbar position="top" visible>
              {!isEditing && <Toolbar.Readonly />}
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
