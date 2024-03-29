import { IconCheck, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocalStorage } from 'react-use';
import { useReactFlow } from 'reactflow';

import type { ApiOrg, PatchFlow } from '@specfy/models';

import { updateFlow, useGetFlow } from '@/api';
import { isError } from '@/api/helpers';
import { i18n } from '@/common/i18n';
import { useFlowStore } from '@/common/store/flow';
import { titleSuffix } from '@/common/string';
import { Banner } from '@/components/Banner';
import { Feedback } from '@/components/Feedback';
import { FlowDetails } from '@/components/Flow/Details';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Toolbar } from '@/components/Flow/Toolbar';
import { FlowWrapper } from '@/components/Flow/Wrapper';
import { Button } from '@/components/Form/Button';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

export const OrgFlow: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const canEdit = currentPerm?.role !== 'viewer';
  const [introRead, setIntroRead] = useLocalStorage(`org.flow.intro`, false);

  const rf = useReactFlow();
  const resFlow = useGetFlow({ org_id: params.org_id, flow_id: org.flowId });
  const store = useFlowStore();
  const [ready, setReady] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);

  useEffect(() => {
    if (!resFlow.data) {
      if (resFlow.error) {
        setReady(true);
      }
      return;
    }

    store.setCurrent(org.flowId, resFlow.data.data.flow);
    store.setMeta({ readOnly: true, connectable: false, deletable: false });
    setReady(true);
  }, [resFlow.data]);

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
    store.setMeta({ readOnly: true });
  };

  if (!ready) {
    return <Loading />;
  }

  return (
    <div className={cls.flow}>
      <Helmet title={`Flow - ${org.name} ${titleSuffix}`} />
      <FlowWrapper>
        {!introRead && (
          <div className={cls.intro}>
            <Banner type="primary" size="s" onClose={() => setIntroRead(true)}>
              Your organization flow is automatically generated based on your
              projects. <br />
              You can only modify the projects position and edges placement.
            </Banner>
          </div>
        )}
        <FlowOrg />

        <FlowDetails />
        {canEdit && (
          <Toolbar left top visible>
            {!editing && (
              <Toolbar.Readonly
                onClick={() => {
                  setEditing(true);
                  store.setMeta({ readOnly: false });
                }}
              />
            )}

            {editing && (
              <Toolbar.Inner>
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
              </Toolbar.Inner>
            )}
            <Toolbar.Help>
              <div>
                <p>
                  Your organization flow is automatically generated based on
                  your projects. You can only modify the projects position and
                  edges placement.
                </p>
                <p>
                  Only contributors can modify this flow. History of
                  modifications is not saved at this moment.
                </p>
              </div>
              <br />
              <Feedback />
            </Toolbar.Help>
          </Toolbar>
        )}
        <Toolbar bottom visible>
          <Toolbar.Zoom />
          {/* <Toolbar.History /> */}
        </Toolbar>
      </FlowWrapper>
    </div>
  );
};
