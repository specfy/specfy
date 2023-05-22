import { LoadingOutlined } from '@ant-design/icons';
import type { ApiOrg } from 'api/src/types/api';
import { useEffect, useState } from 'react';

import { useListProjects } from '../../../api';
import { useProjectStore } from '../../../common/store';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type {
  ComponentForFlow,
  ComputedFlow,
} from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgFlow: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const storeProjects = useProjectStore();
  const res = useListProjects({ org_id: params.org_id });

  const [loading, setLoading] = useState<boolean>(true);
  const [components, setComponents] = useState<ComponentForFlow[]>([]);
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
          techId: null,
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
      {flow && (
        <>
          <FlowWrapper>
            <Flow
              flow={flow}
              downlightOther={false}
              keepHighlightOnSelect={true}
              readonly
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
