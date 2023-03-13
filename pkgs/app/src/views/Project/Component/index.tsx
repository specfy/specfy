import { Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TechInfo } from '../../../common/component';
import { supportedIndexed } from '../../../common/component';
import { useComponentsStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { ComponentDetails } from '../../../components/ComponentDetails';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import { FakeInput } from '../../../components/Input';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';
import type { RouteComponent } from '../../../types/routes';

import cls from './index.module.scss';

export const ComponentView: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const gref = useGraph();

  // TODO: filter RFC
  const [comp, setComp] = useState<ApiComponent>();
  const [info, setInfo] = useState<TechInfo>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();
  const params = useParams<Partial<RouteComponent>>() as RouteComponent;

  // Components
  const [components, setComponents] = useState<ApiComponent[]>();

  // Edition
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const storeComponents = useComponentsStore();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
    setComp(storeComponents.select(params.component_slug));
  }, [params.component_slug, storeComponents]);

  useEffect(() => {
    if (!comp) {
      return;
    }

    if (comp.techId && comp.techId in supportedIndexed) {
      setInfo(supportedIndexed[comp.techId]);
      setIcon(supportedIndexed[comp.techId].Icon);
    } else {
      setInfo(undefined);
      setIcon(undefined);
    }
  }, [comp]);

  useEffect(() => {
    if (!gref || !comp) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight();
      gref.setHighlight(comp!.id);
    }, 500);
  }, [comp]);

  if (!comp) {
    return <div>not found</div>;
  }

  return (
    <Container>
      <Container.Left>
        <Card padded>
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
            <FakeInput.H1
              size="large"
              value={comp.name}
              placeholder="Title..."
              onChange={(e) => {
                storeComponents.updateField(comp!.id, 'name', e.target.value);
              }}
            />
          )}

          <Typography>
            {!isEditing && comp.description && (
              <ContentDoc doc={comp.description} />
            )}
            {!comp.description?.content.length && !isEditing && (
              <Typography.Text type="secondary">
                Write something...
              </Typography.Text>
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
        <Card>
          <GraphContainer>
            <Graph readonly={true} components={components!} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>
      </Container.Right>
    </Container>
  );
};
