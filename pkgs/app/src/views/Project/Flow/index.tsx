import type { ApiProject, ApiComponent } from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type {
  OnEdgesChangeSuper,
  OnNodesChangeSuper,
} from '../../../components/Flow/types';
import { Loading } from '../../../components/Loading';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

import { createLocal } from '@/common/components';
import {
  onEdgesChangeProject,
  onNodesChangeProject,
  useComponentsStore,
  useFlowStore,
  useProjectStore,
} from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Feedback } from '@/components/Feedback';
import { FlowProject } from '@/components/Flow/FlowProject';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const { isEditing, enable } = useEdit();
  const storeComponents = useComponentsStore();
  const storeProjects = useProjectStore();
  const storeFlow = useFlowStore();

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

    storeFlow.setCurrent(componentsToFlow(components));
    storeFlow.setReadonly(true);
    storeFlow.setHighlight(null);
  }, [components]);

  // ---- Event Handlers
  const onNodesChange = useCallback<OnNodesChangeSuper>(
    (changes) => onNodesChangeProject(storeComponents)(changes),
    [components]
  );
  const onEdgesChange = useCallback<OnEdgesChangeSuper>(
    (changes) => onEdgesChangeProject(storeComponents)(changes),
    [components]
  );

  const onCreateNode: React.ComponentProps<typeof Flow>['onCreateNode'] = (
    type,
    position
  ) => {
    const { id } = createLocal(
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
    return <Loading />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${proj.name} ${titleSuffix}`} />

      <FlowWrapper>
        <FlowProject />

        {/* <FlowDetails
          readonly={!isEditing}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        /> */}
        {isEditing && (
          <Toolbar left center visible>
            <Toolbar.AddComponents />
          </Toolbar>
        )}
        <Toolbar left top visible>
          {!isEditing && (
            <Toolbar.Readonly
              onClick={() => {
                enable(true);
                storeFlow.setReadonly(false);
              }}
            />
          )}
          <Toolbar.Help>
            <div>
              <p>
                Your project flow is automatically kept up to date when you push
                a commit in your repository. Deleted nodes and connections found
                on Github will be added back.
              </p>
              <p>
                Only contributors can modify this flow. Modifications are always
                saved in a revision.
              </p>
            </div>
            <br />
            <Feedback />
          </Toolbar.Help>
        </Toolbar>
        <Toolbar bottom visible>
          <Toolbar.Zoom />
          {/* <Toolbar.History /> */}
        </Toolbar>
      </FlowWrapper>
    </div>
  );
};
