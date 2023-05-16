import { Skeleton, Typography } from 'antd';
import type { ApiComponent, BlockLevelZero } from 'api/src/types/api';
import { useCallback, useEffect, useState } from 'react';

import { useComponentsStore, useProjectStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import type { ComputedFlow } from '../../../components/Flow/helpers';
import { componentsToFlow } from '../../../components/Flow/helpers';
import { ListActivity } from '../../../components/ListActivity';
import { ListRFCs } from '../../../components/ListRFCs';
import { ProjectLinks } from '../../../components/Project/Links';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { Team } from './Team';
import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

export const ProjectOverview: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const edit = useEdit();
  const storeComponents = useComponentsStore();
  const { update, project } = useProjectStore();

  const [components, setComponents] = useState<ApiComponent[]>();
  const [flow, setFlow] = useState<ComputedFlow>();
  const isEditing = edit.isEnabled();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    setFlow(componentsToFlow(components));
  }, [components]);

  const onUpdate = useCallback((doc: BlockLevelZero) => {
    update({ ...project!, description: doc });
  }, []);

  if (!project) {
    return null;
  }

  return (
    <Container>
      <Container.Left>
        <Card padded>
          <Typography>
            {!isEditing && <ContentDoc doc={project.description} />}
            {isEditing && (
              <EditorMini
                key={project.id}
                doc={project.description}
                onUpdate={onUpdate}
              />
            )}
          </Typography>

          <ProjectLinks />

          <div className={cls.block}>
            <Typography.Title level={5}>Technical Aspect</Typography.Title>
            <TechnicalAspects params={params} />
          </div>

          <div className={cls.block}>
            <Typography.Title level={5}>Team</Typography.Title>
            <Team org_id={params.org_id} project_id={project.id} />
          </div>
        </Card>

        <Card padded>
          <ListRFCs project={project}></ListRFCs>
        </Card>
      </Container.Left>
      <Container.Right>
        <div>
          {!flow ? (
            <Skeleton.Image active></Skeleton.Image>
          ) : (
            <FlowWrapper>
              <Flow flow={flow} />
              <Toolbar position="bottom">
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
        </div>

        <ListActivity orgId={params.org_id} projectId={project.id} />
      </Container.Right>
    </Container>
  );
};
