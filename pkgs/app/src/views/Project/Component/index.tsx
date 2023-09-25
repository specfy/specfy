import type { ApiComponent, ApiProject } from '@specfy/models';
import { internalTypeToText } from '@specfy/models/src/components/constants';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import {
  IconDotsVertical,
  IconTrash,
  IconPackageImport,
  IconEyeOff,
  IconEye,
} from '@tabler/icons-react';
import classnames from 'classnames';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow } from 'reactflow';

import { ComponentDetails } from '../../../components/Component/Details';
import { ComponentIcon } from '../../../components/Component/Icon';
import { Container, ContainerChild } from '../../../components/Container';
import {
  ContentDoc,
  Placeholder,
  Presentation,
} from '../../../components/Content';
import * as Dropdown from '../../../components/Dropdown';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flex } from '../../../components/Flex';
import { TechPopover } from '../../../components/Flow/TechPopover';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { FlowWrapper } from '../../../components/Flow/Wrapper';
import type { OnNodesChangeSuper } from '../../../components/Flow/types';
import { Button } from '../../../components/Form/Button';
import { FakeInput } from '../../../components/Form/FakeInput';
import { NotFound } from '../../../components/NotFound';
import { TooltipFull } from '../../../components/Tooltip';
import { UpdatedAt } from '../../../components/UpdatedAt';
import { useAuth } from '../../../hooks/useAuth';
import { useEdit } from '../../../hooks/useEdit';
import { useToast } from '../../../hooks/useToast';
import type { RouteComponent } from '../../../types/routes';

import cls from './index.module.scss';

import {
  onNodesChangeProject,
  useComponentsStore,
  useFlowStore,
} from '@/common/store';
import { titleSuffix } from '@/common/string';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Editable } from '@/components/Form/Editable';
import { Loading } from '@/components/Loading';

const Header: React.FC<{
  comp: ApiComponent;
  proj: ApiProject;
}> = ({ comp, proj }) => {
  const toast = useToast();
  const edit = useEdit();
  const storeComponents = useComponentsStore();
  const { currentPerm } = useAuth();
  const canEdit = currentPerm?.role !== 'viewer';
  const navigate = useNavigate();

  const onRemove = () => {
    edit.enable(true);
    storeComponents.remove(comp!.id);
    toast.add({ title: 'Component deleted', status: 'success' });
    navigate(`/${proj.orgId}/${proj.slug}`);
  };

  const onVisibility = () => {
    edit.enable(true);
    // storeComponents.updateField(comp!.id, 'show', show);
    onNodesChangeProject(storeComponents)([
      { type: 'visibility', id: comp!.id },
    ]);
    toast.add({
      title: !comp!.show ? 'Component is visible' : 'Component will be hidden',
      status: 'success',
    });
  };

  return (
    <Flex align="center">
      <Flex>
        {!comp.show && (
          <TooltipFull msg={`This component is hidden`} side="bottom">
            <Button size="s" display="ghost" onClick={onVisibility}>
              <IconEyeOff />
            </Button>
          </TooltipFull>
        )}
        {comp.source && (
          <TooltipFull
            msg={`This component is managed by: ${comp.source}`}
            side="bottom"
          >
            <Button size="s" display="ghost">
              <IconPackageImport />
            </Button>
          </TooltipFull>
        )}
      </Flex>
      {canEdit && (
        <div>
          <Dropdown.Menu>
            <Dropdown.Trigger asChild>
              <Button display="ghost" size="s">
                <IconDotsVertical />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Group>
                <Dropdown.Item asChild>
                  <TooltipFull
                    msg="Hide or show the component in the Flow"
                    side="right"
                  >
                    <Button display="item" onClick={onVisibility} size="s">
                      {comp.show ? (
                        <>
                          <IconEyeOff /> Hide
                        </>
                      ) : (
                        <>
                          <IconEye /> Show
                        </>
                      )}
                    </Button>
                  </TooltipFull>
                </Dropdown.Item>
                {!comp.source && (
                  <Dropdown.Item asChild>
                    <Button danger display="item" onClick={onRemove} size="s">
                      <IconTrash /> Remove
                    </Button>
                  </Dropdown.Item>
                )}
              </Dropdown.Group>
            </Dropdown.Content>
          </Dropdown.Menu>
        </div>
      )}
    </Flex>
  );
};

export const ComponentView: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const { getNodes, viewportInitialized } = useReactFlow();

  const [loading, setLoading] = useState<boolean>(true);
  const [comp, setComp] = useState<ApiComponent>();
  const params = useParams<Partial<RouteComponent>>() as RouteComponent;

  // Components
  const [components, setComponents] = useState<ApiComponent[]>();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
  const storeComponents = useComponentsStore();
  const storeFlow = useFlowStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    const split = params.component_slug.split('-')[0];
    storeComponents.setCurrent(split);
  }, [params.component_slug]);

  useEffect(() => {
    setLoading(false);
    setComponents(Object.values(storeComponents.components));
    const curr = storeComponents.select(storeComponents.current!);
    setComp(curr);
  }, [storeComponents]);

  useEffect(() => {
    const nodes = getNodes();
    if (nodes.length <= 0) {
      return;
    }

    const node = nodes.find((n) => n.id === comp?.id);
    if (!node) {
      return;
    }
  }, [viewportInitialized]);

  useEffect(() => {
    if (!components) {
      return;
    }

    storeFlow.setCurrent(proj.id, componentsToFlow(components));
    storeFlow.setMeta({ readOnly: true });
    storeFlow.setHighlight(comp!.id);
  }, [components]);

  const onNodesChange: OnNodesChangeSuper = (changes) => {
    onNodesChangeProject(storeComponents)(changes);
  };

  if (loading) {
    return <Loading />;
  }
  if (!comp) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Helmet title={`${comp.name} - ${proj.name} ${titleSuffix}`} />

      <ContainerChild leftLarge className={cls.main}>
        <div className={cls.content}>
          <Flex align="center" justify="space-between" gap="l">
            <Flex align="center" gap="l" grow>
              {comp.source ? (
                <TooltipFull
                  msg={`This component is managed by: ${comp.source}`}
                  side="bottom"
                >
                  <div>
                    <ComponentIcon data={comp} large noEmpty />
                  </div>
                </TooltipFull>
              ) : (
                <div>
                  {isEditing ? (
                    <TechPopover
                      id={comp.id}
                      techId={comp.techId || comp.typeId}
                      data={comp}
                      onNodesChange={onNodesChange}
                    />
                  ) : (
                    <Editable inline>
                      <ComponentIcon data={comp} large noEmpty />
                    </Editable>
                  )}
                </div>
              )}

              <TooltipFull
                msg={
                  isEditing &&
                  comp.type === 'project' &&
                  "Can't edit Project name"
                }
                side="top"
              >
                {!isEditing || comp.type === 'project' ? (
                  <Editable>
                    <h2>
                      <Flex gap="l">{comp.name}</Flex>
                    </h2>
                  </Editable>
                ) : (
                  <FakeInput.H2
                    size="l"
                    value={comp.name}
                    placeholder="Title..."
                    onChange={(e) => {
                      storeComponents.updateField(
                        comp.id,
                        'name',
                        e.target.value
                      );
                    }}
                  />
                )}
              </TooltipFull>
            </Flex>
            <Header comp={comp} proj={proj} />
          </Flex>
          <Flex gap="m" align="flex-start">
            <div
              className={classnames(
                cls.tagType,
                comp.type in cls && cls[comp.type as keyof typeof cls]
              )}
            >
              {internalTypeToText[comp.type]}
            </div>
            ·
            <UpdatedAt time={comp.updatedAt} />
          </Flex>

          {!isEditing && comp.description && (
            <Editable padded>
              <Presentation>
                <ContentDoc
                  doc={comp.description}
                  placeholder={
                    <Placeholder text="Explain why it exists and how it works" />
                  }
                />
              </Presentation>
            </Editable>
          )}
          {isEditing && (
            <EditorMini
              key={comp.id}
              doc={comp.description}
              placeholder="Explain why it exists and how it works"
              onUpdate={(doc) => {
                storeComponents.updateField(comp.id, 'description', doc);
              }}
            />
          )}
        </div>

        <ComponentDetails proj={proj} component={comp} params={params} />
      </ContainerChild>
      <ContainerChild rightSmall>
        <FlowWrapper key={proj.id} columnMode>
          <FlowOrg />
          <Toolbar bottom>
            <Toolbar.Fullscreen to={`${proj.orgId}/${proj.slug}`} />
            <Toolbar.Zoom />
          </Toolbar>
        </FlowWrapper>
      </ContainerChild>
    </Container>
  );
};
