import type { ComputedFlow, ApiOrg, PatchFlow } from '@specfy/models';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useReactFlow } from 'reactflow';

import { updateFlow, useGetFlow } from '../../../api';
import { isError } from '../../../api/helpers';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { FlowDetails } from '../../../components/Flow/Details';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { Button } from '../../../components/Form/Button';
import { Loading } from '../../../components/Loading';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

import { i18n } from '@/common/i18n';
import { titleSuffix } from '@/common/string';

export const OrgFlow: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const canEdit = currentPerm?.role !== 'viewer';

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
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Published', status: 'success' });
  };

  const onCancel = () => {
    setEditing(false);
  };

  if (resFlow.isLoading) {
    return <Loading />;
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
            {canEdit && (
              <Toolbar left top visible>
                {!editing && (
                  <Toolbar.Readonly onClick={() => setEditing(true)} />
                )}
                <Toolbar.Inner>
                  {editing && (
                    <>
                      <Button
                        onClick={() => onSave()}
                        display="ghost"
                        loading={publishing}
                      >
                        <IconCheck />
                        Publish
                      </Button>
                      <Button onClick={() => onCancel()} display="ghost">
                        <IconX />
                      </Button>
                    </>
                  )}
                </Toolbar.Inner>
              </Toolbar>
            )}
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
