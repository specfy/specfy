import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Skeleton, App, Button, Dropdown, Tag, Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow } from 'reactflow';

import type { TechInfo } from '../../../common/component';
import {
  internalTypeToText,
  supportedIndexed,
} from '../../../common/component';
import { useComponentsStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { ComponentDetails } from '../../../components/ComponentDetails';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { ComputedFlow } from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import { FakeInput } from '../../../components/Input';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteComponent } from '../../../types/routes';

import cls from './index.module.scss';

export const ComponentView: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const { message } = App.useApp();
  const { getNodes, viewportInitialized } = useReactFlow();
  const navigate = useNavigate();

  // TODO: filter RFC
  const [comp, setComp] = useState<ApiComponent>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();
  const params = useParams<Partial<RouteComponent>>() as RouteComponent;

  // Components
  const [components, setComponents] = useState<ApiComponent[]>();
  const [flow, setFlow] = useState<ComputedFlow>();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
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

    if (comp.techId && comp.techId in supportedIndexed) {
      setIcon(supportedIndexed[comp.techId].Icon);
    } else {
      setIcon(undefined);
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
      message.success('Component deleted');
      navigate(`/${params.org_id}/${params.project_slug}`);
    }
  };

  if (!comp) {
    return <div>not found</div>;
  }

  return (
    <Container>
      <Container.Left>
        <Card padded>
          <div className={cls.titleEdit}>
            {!isEditing && (
              <Typography.Title level={1}>
                {Icon && (
                  <div className={cls.icon}>
                    <Icon size="1em" />
                  </div>
                )}
                {comp.name}
              </Typography.Title>
            )}
            {isEditing && (
              <FakeInput.H2
                size="large"
                value={comp.name}
                placeholder="Title..."
                onChange={(e) => {
                  storeComponents.updateField(comp!.id, 'name', e.target.value);
                }}
              />
            )}
            <div className={cls.actions}>
              <Tag className={classnames(cls.tagType, cls[comp.type])}>
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
            </div>
          </div>

          <Typography>
            {!isEditing && comp.description && (
              <ContentDoc doc={comp.description} />
            )}
            {isEditing && (
              <EditorMini
                key={comp.id}
                doc={comp.description}
                onUpdate={(doc) => {
                  storeComponents.updateField(comp!.id, 'description', doc);
                }}
              />
            )}
          </Typography>

          <ComponentDetails
            proj={proj}
            component={comp}
            components={components!}
            params={params}
          />
        </Card>
        <Card padded>
          <ListRFCs project={proj}></ListRFCs>
        </Card>
      </Container.Left>
      <Container.Right>
        <div>
          {!flow ? (
            <Skeleton.Image active></Skeleton.Image>
          ) : (
            <FlowWrapper>
              <Flow flow={flow} highlight={comp.id} />
              <Toolbar position="bottom">
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
        </div>
      </Container.Right>
    </Container>
  );
};
