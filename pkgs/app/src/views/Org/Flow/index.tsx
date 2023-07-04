import { LoadingOutlined } from '@ant-design/icons';
import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type {
  ComponentForFlow,
  ComputedFlow,
} from '@specfy/api/src/common/flow/types';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useListProjects } from '../../../api';
import { useProjectStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgFlow: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
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
          typeId: null,
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
      <Helmet title={`Flow - ${org.name} ${titleSuffix}`} />
      {flow && (
        <>
          <FlowWrapper>
            <Flow
              flow={flow}
              downlightOther={false}
              keepHighlightOnSelect={true}
              readonly={true}
            />
            <Toolbar position="top" visible>
              {!true && <Toolbar.Readonly />}
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
