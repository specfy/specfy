import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ComputedFlow } from '@specfy/api/src/common/flow/types';
import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
import { IconDotsVertical } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { App, Button, Dropdown, Tag, Typography } from 'antd';
import classnames from 'classnames';
import type { MenuClickEventHandler } from 'rc-menu/lib/interface';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow } from 'reactflow';

import type { TechInfo } from '../../../common/component';
import {
  internalTypeToText,
  supportedIndexed,
} from '../../../common/component';
import { useComponentsStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import { ComponentDetails } from '../../../components/ComponentDetails';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { FakeInput } from '../../../components/Input';
import { NotFound } from '../../../components/NotFound';
import { UpdatedAt } from '../../../components/UpdatedAt';
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
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Helmet title={`${comp.name} - ${proj.name} ${titleSuffix}`} />

      <Container.Left2Third>
        <Card padded seamless large>
          <div className={cls.titleEdit}>
            {!isEditing && (
              <h2>
                {Icon && (
                  <div className={cls.icon}>
                    <Icon size="1em" />
                  </div>
                )}
                {comp.name}
              </h2>
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
        {/* <Card padded>
          <ListRFCs project={proj}></ListRFCs>
        </Card> */}
      </Container.Left2Third>
      <Container.Right1Third>
        <div>
          {flow && (
            <FlowWrapper style={{ height: '350px' }}>
              <Flow flow={flow} highlight={comp.id} readonly />
              <Toolbar position="bottom">
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
