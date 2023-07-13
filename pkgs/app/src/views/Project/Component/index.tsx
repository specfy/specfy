import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Tooltip, Button, Dropdown, Tag, Typography } from 'antd';
import classnames from 'classnames';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import { EditorMini } from '../../../components/Editor/Mini';
import { Flex } from '../../../components/Flex';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { TechPopover } from '../../../components/Flow/TechPopover';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { OnNodesChangeSuper } from '../../../components/Flow/helpers';
import { onNodesChangeProject } from '../../../components/Flow/helpers';
import { FakeInput } from '../../../components/Input';
import { NotFound } from '../../../components/NotFound';
import { UpdatedAt } from '../../../components/UpdatedAt';
import { useEdit } from '../../../hooks/useEdit';
import { useToast } from '../../../hooks/useToast';
import type { RouteComponent } from '../../../types/routes';

import cls from './index.module.scss';

export const ComponentView: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const toast = useToast();
  const { getNodes, viewportInitialized } = useReactFlow();
  const navigate = useNavigate();

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

  const menuItems = useMemo<MenuProps['items']>(() => {
    return [{ key: 'delete', label: 'Delete', danger: true }];
  }, []);

  const onClickMenu: MenuClickEventHandler = (e) => {
    if (e.key === 'delete') {
      edit.enable(true);
      storeComponents.remove(comp!.id);
      toast.add({ title: 'Component deleted', status: 'success' });
      navigate(`/${params.org_id}/${params.project_slug}`);
    }
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
            <Flex alignItems="center" justifyContent="space-between">
              <Flex alignItems="center" gap="l">
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

                <Tooltip
                  title={
                    isEditing &&
                    comp.type === 'project' &&
                    "Can't edit Project name"
                  }
                  placement="top"
                >
                  {!isEditing || comp.type === 'project' ? (
                    <h2>
                      <Flex gap="l">{comp.name}</Flex>
                    </h2>
                  ) : (
                    <FakeInput.H2
                      size="large"
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
                </Tooltip>
              </Flex>
              <Flex alignItems="center">
                <Tag
                  className={classnames(
                    cls.tagType,
                    comp.type in cls && cls[comp.type as keyof typeof cls]
                  )}
                >
                  {internalTypeToText[comp.type]}
                </Tag>
                <div>
                  <Dropdown menu={{ items: menuItems, onClick: onClickMenu }}>
                    <Button
                      icon={<IconDotsVertical />}
                      type="ghost"
                      size="small"
                    />
                  </Dropdown>
                </div>
              </Flex>
            </Flex>
            <UpdatedAt time={comp.updatedAt} />

            <Typography>
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
            </Typography>
          </div>

          <ComponentDetails
            proj={proj}
            component={comp}
            components={components!}
            params={params}
          />
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
