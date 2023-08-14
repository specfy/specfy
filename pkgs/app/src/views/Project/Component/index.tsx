import type { ComputedFlow, ApiComponent, ApiProject } from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import classnames from 'classnames';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow } from 'reactflow';

import { useComponentsStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { internalTypeToText } from '../../../common/techs';
import { Card } from '../../../components/Card';
import { ComponentDetails } from '../../../components/Component/Details';
import { ComponentIcon } from '../../../components/Component/Icon';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import * as Dropdown from '../../../components/Dropdown';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flex } from '../../../components/Flex';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { TechPopover } from '../../../components/Flow/TechPopover';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { OnNodesChangeSuper } from '../../../components/Flow/helpers';
import { onNodesChangeProject } from '../../../components/Flow/helpers';
import { Button } from '../../../components/Form/Button';
import { FakeInput } from '../../../components/Form/FakeInput';
import { NotFound } from '../../../components/NotFound';
import { Tag } from '../../../components/Tag';
import { TooltipFull } from '../../../components/Tooltip';
import { UpdatedAt } from '../../../components/UpdatedAt';
import { useAuth } from '../../../hooks/useAuth';
import { useEdit } from '../../../hooks/useEdit';
import { useToast } from '../../../hooks/useToast';
import type { RouteComponent } from '../../../types/routes';

import cls from './index.module.scss';

export const ComponentView: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const { getNodes, viewportInitialized } = useReactFlow();
  const navigate = useNavigate();
  const canEdit = currentPerm?.role !== 'viewer';

  const [comp, setComp] = useState<ApiComponent>();
  const params = useParams<Partial<RouteComponent>>() as RouteComponent;

  // Components
  const [components, setComponents] = useState<ApiComponent[]>();
  const [flow, setFlow] = useState<ComputedFlow>();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEditing;
  const storeComponents = useComponentsStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    const split = params.component_slug.split('-')[0];
    storeComponents.setCurrent(split);
  }, [params.component_slug]);

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
    const curr = storeComponents.select(storeComponents.current!);
    setComp(curr);
  }, [storeComponents]);

  useEffect(() => {
    if (!comp) {
      return;
    }
  }, [comp?.techId]);

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

    setFlow(componentsToFlow(components));
  }, [components]);

  const onRemove = () => {
    edit.enable(true);
    storeComponents.remove(comp!.id);
    toast.add({ title: 'Component deleted', status: 'success' });
    navigate(`/${params.org_id}/${params.project_slug}`);
  };

  const onNodesChange: OnNodesChangeSuper = (changes) => {
    onNodesChangeProject(storeComponents)(changes);
  };

  if (!comp) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Helmet title={`${comp.name} - ${proj.name} ${titleSuffix}`} />

      <Container.Left2Third>
        <Card padded seamless large>
          <div className={cls.content}>
            <Flex align="center" justify="space-between">
              <Flex align="center" gap="l">
                {isEditing ? (
                  <TechPopover
                    id={comp.id}
                    techId={comp.techId || comp.typeId}
                    data={comp}
                    onNodesChange={onNodesChange}
                  />
                ) : (
                  <ComponentIcon data={comp} large />
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
                    <h2>
                      <Flex gap="l">{comp.name}</Flex>
                    </h2>
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
              <Flex align="center">
                <Tag
                  variant="border"
                  className={classnames(
                    cls.tagType,
                    comp.type in cls && cls[comp.type as keyof typeof cls]
                  )}
                >
                  {internalTypeToText[comp.type]}
                </Tag>
                {canEdit && (
                  <div>
                    <Dropdown.Menu>
                      <Dropdown.Trigger asChild>
                        <Button display="ghost">
                          <IconDotsVertical />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Portal>
                        <Dropdown.Content>
                          <Dropdown.Group>
                            <Dropdown.Item asChild>
                              <Button
                                danger
                                display="item"
                                block
                                onClick={() => onRemove()}
                                size="s"
                              >
                                <IconTrash /> Remove
                              </Button>
                            </Dropdown.Item>
                          </Dropdown.Group>
                        </Dropdown.Content>
                      </Dropdown.Portal>
                    </Dropdown.Menu>
                  </div>
                )}
              </Flex>
            </Flex>
            <UpdatedAt time={comp.updatedAt} />

            {!isEditing && comp.description && (
              <ContentDoc doc={comp.description} noPlaceholder />
            )}
            {isEditing && (
              <EditorMini
                key={comp.id}
                doc={comp.description}
                onUpdate={(doc) => {
                  storeComponents.updateField(comp.id, 'description', doc);
                }}
              />
            )}
          </div>

          <ComponentDetails proj={proj} component={comp} params={params} />
        </Card>
      </Container.Left2Third>
      <Container.Right1Third>
        <div>
          {flow && (
            <FlowWrapper style={{ height: '350px' }}>
              <Flow flow={flow} highlight={comp.id} readonly />
              <Toolbar bottom>
                <Toolbar.Fullscreen project={proj} />
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
        </div>
      </Container.Right1Third>
    </Container>
  );
};
