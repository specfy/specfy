import type { ApiProject } from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { Loading } from '../../../components/Loading';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

import { useComponentsStore, useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Feedback } from '@/components/Feedback';
import { FlowDetails } from '@/components/Flow/Details';
import { FlowProject } from '@/components/Flow/FlowProject';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const { isEditing, enable } = useEdit();
  const storeComponents = useComponentsStore();
  const idFlow = useFlowStore((state) => state.id);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    useFlowStore.getState().setHighlight(null);
  }, []);
  useEffect(() => {
    if (proj.id === idFlow) {
      setLoading(false);
      return;
    }

    // We don't use the hook to avoid rerendering the view on each update
    useFlowStore
      .getState()
      .setCurrent(
        proj.id,
        componentsToFlow(Object.values(storeComponents.components))
      );
    setLoading(false);
  }, [idFlow, storeComponents.components]);

  useEffect(() => {
    if (isEditing) {
      useFlowStore.getState().setMeta({
        readOnly: false,
        connectable: true,
        deletable: true,
      });
    } else {
      useFlowStore.getState().setMeta({
        readOnly: true,
        connectable: false,
        deletable: false,
      });
    }
  }, [isEditing]);

  useEffect(() => {
    const unsub = useFlowStore.subscribe((state) => {
      useComponentsStore.getState().syncFromFlow(state, proj);
    });
    return () => {
      unsub();
    };
  }, []);

  // ---- Event Handlers
  // const onNodesChange = useCallback<OnNodesChangeSuper>(
  //   (changes) => onNodesChangeProject(storeComponents)(changes),
  //   [components]
  // );
  // const onEdgesChange = useCallback<OnEdgesChangeSuper>(
  //   (changes) => onEdgesChangeProject(storeComponents)(changes),
  //   [components]
  // );

  // const onCreateNode: React.ComponentProps<typeof Flow>['onCreateNode'] = (
  //   type,
  //   position
  // ) => {
  //   const { id } = createLocal(
  //     {
  //       name: 'untitled',
  //       slug: 'untitled',
  //       type,
  //       position,
  //     },
  //     storeProjects,
  //     storeComponents
  //   );

  //   return id;
  // };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${proj.name} ${titleSuffix}`} />

      <FlowWrapper>
        <FlowProject />

        <FlowDetails />
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
