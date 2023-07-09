import { LoadingOutlined } from '@ant-design/icons';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useGetFlow } from '../../../api/flows';
import { titleSuffix } from '../../../common/string';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { FlowDetails } from '../../../components/Flow/Details';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgFlow: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const [flow, setFlow] = useState<ComputedFlow>();

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    setFlow(resFlow.data.data.flow);
  }, [resFlow]);

  if (resFlow.isLoading) {
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

            <FlowDetails
              readonly={true}
              flow={flow}
              onRelationChange={() => null}
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
