import { LoadingOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import type { ApiProject, ApiComponent } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useComponentsStore } from '../../../common/store';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { ComputedFlow } from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

// import { GraphEdit } from './Edit';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  const edit = useEdit();
  const storeComponents = useComponentsStore();
  const [flow, setFlow] = useState<ComputedFlow>();

  // const isEditing = edit.isEnabled();
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

  if (loading) {
    return <LoadingOutlined />;
  }

  return (
    <div
      style={{
        width: 'calc(100vw - 24px * 2)',
        height: 'calc(100vh - 180px)',
      }}
    >
      {!flow ? (
        <Skeleton.Image active></Skeleton.Image>
      ) : (
        <>
          {/* <GraphEdit comps={components!} proj={proj} /> */}
          <FlowWrapper>
            <Flow flow={flow} />
            <Toolbar position="top" visible>
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
