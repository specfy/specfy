import type {
  ComputedFlow,
  ApiComponent,
  BlockLevelZero,
} from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useCallback, useEffect, useState } from 'react';

import { useComponentsStore, useProjectStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { ListActivity } from '../../../components/ListActivity';
import { ProjectLinks } from '../../../components/Project/Links';
import { TeamSummary } from '../../../components/Team/Summary';
import { UpdatedAt } from '../../../components/UpdatedAt';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

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
  const isEditing = edit.isEditing;

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    const tmp = componentsToFlow(components);
    setFlow(tmp);
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
          <h1>{project.name}</h1>
          <UpdatedAt time={project.updatedAt} />
          <div className={cls.desc}>
            {!isEditing && <ContentDoc doc={project.description} />}
            {isEditing && (
              <EditorMini
                key={project.id}
                doc={project.description}
                onUpdate={onUpdate}
              />
            )}
          </div>

          <ProjectLinks />

          {components && components.length > 0 && (
            <div className={cls.block}>
              <h2>Technical Aspect</h2>
              <TechnicalAspects params={params} />
            </div>
          )}

          <div className={cls.block}>
            <h2>Team</h2>
            <TeamSummary org_id={params.org_id} project_id={project.id} />
          </div>
        </Card>
      </Container.Left2Third>
      <Container.Right1Third>
        <div style={{ height: '350px' }}>
          {flow && (
            <FlowWrapper style={{ height: '350px' }} key={project.id}>
              <Flow flow={flow} readonly />
              <Toolbar bottom>
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
