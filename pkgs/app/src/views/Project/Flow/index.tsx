import { LoadingOutlined } from '@ant-design/icons';
import type { ApiProject, ApiComponent } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useComponentsStore } from '../../../common/store';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { ComputedFlow } from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import type { RouteProject } from '../../../types/routes';

import { FlowEdit } from './Edit';
import cls from './index.module.scss';

export const ProjectFlow: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
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
    <div className={cls.flow}>
      <FlowEdit components={components!} proj={proj} />
      {flow && (
        <>
          <FlowWrapper>
            <Flow
              flow={flow}
              downlightOther={false}
              keepHighlightOnSelect={true}
            />
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
