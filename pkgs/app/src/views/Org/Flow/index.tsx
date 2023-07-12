import { LoadingOutlined } from '@ant-design/icons';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiOrg, PatchFlow } from '@specfy/api/src/types/api';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { App, Button } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useReactFlow } from 'reactflow';

import { updateFlow, useGetFlow } from '../../../api/flows';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
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
  const { message } = App.useApp();

  const rf = useReactFlow();
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const [flow, setFlow] = useState<ComputedFlow>();
  const [editing, setEditing] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  useEffect(() => {
    if (!resFlow.data) {
      return;
    }

    setFlow(resFlow.data.data.flow);
  }, [resFlow]);

  const onSave = async () => {
    setPublishing(true);
    const snap = rf.toObject();
    const edges: PatchFlow['Body']['updates']['edges'] = {};
    const nodes: PatchFlow['Body']['updates']['nodes'] = {};
    for await (const edge of snap.edges) {
      edges[edge.id] = {
        sourceHandle: edge.sourceHandle as any,
        targetHandle: edge.targetHandle as any,
      };
    }
    for await (const node of snap.nodes) {
      nodes[node.id] = {
        display: {
          pos: node.position,
          size: { width: node.width!, height: node.height! },
        },
      };
    }

    const res = await updateFlow(
      {
        ...params,
        flow_id: org.flowId,
      },
      {
        updates: { edges, nodes },
      }
    );
    setPublishing(false);
    if (isError(res)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Published');
  };

  const onCancel = () => {
    setEditing(false);
  };

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
              readonly={!editing}
              deletable={false}
              connectable={false}
            />

            <FlowDetails
              readonly={true}
              flow={flow}
              onRelationChange={() => null}
            />
            <Toolbar left top visible>
              <Toolbar.Inner>
                {!editing && (
                  <Button
                    onClick={() => setEditing(true)}
                    type="text"
                    icon={<IconEdit />}
                  >
                    Edit
                  </Button>
                )}
                {editing && (
                  <>
                    <Button
                      onClick={() => onSave()}
                      type="text"
                      icon={<IconCheck />}
                      loading={publishing}
                    >
                      Publish
                    </Button>
                    <Button
                      onClick={() => onCancel()}
                      type="text"
                      icon={<IconX />}
                    />
                  </>
                )}
              </Toolbar.Inner>
            </Toolbar>
            <Toolbar bottom visible>
              <Toolbar.Zoom />
              {/* <Toolbar.History /> */}
            </Toolbar>
          </FlowWrapper>
        </>
      )}
    </div>
  );
};
