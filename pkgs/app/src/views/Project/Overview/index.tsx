import { Typography } from 'antd';
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
    <Container noPadding>
      <Container.Left2Third>
        <Card padded large seamless>
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
      </Container.Left2Third>
      <Container.Right1Third>
        <div>
          {flow && (
            <FlowWrapper style={{ height: '350px' }}>
              <Flow flow={flow} readonly />
              <Toolbar position="bottom">
                <Toolbar.Fullscreen project={project} />
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
        </div>

        <Card padded seamless transparent>
          <ListActivity orgId={params.org_id} projectId={project.id} />
        </Card>
      </Container.Right1Third>
    </Container>
  );
};
