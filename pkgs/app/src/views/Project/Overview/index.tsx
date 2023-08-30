import type {
  ComputedFlow,
  ApiComponent,
  BlockLevelZero,
} from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useCallback, useEffect, useState } from 'react';

import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc, Placeholder } from '../../../components/Content';
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

import { useComponentsStore, useProjectStore } from '@/common/store';

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

  const onUpdate = useCallback(
    (doc: BlockLevelZero) => {
      update({ ...project!, description: doc });
    },
    [project, update]
  );

  if (!project) {
    return null;
  }

  return (
    <Container noPadding>
      <Container.Left2Third>
        <div className={cls.main}>
          <h1>{project.name}</h1>
          <UpdatedAt time={project.updatedAt} />
          <div className={cls.desc}>
            {!isEditing && (
              <ContentDoc
                doc={project.description}
                placeholder={<Placeholder />}
              />
            )}
            {isEditing && (
              <EditorMini
                key={project.id}
                doc={project.description}
                aiTools={['project.description', 'rewrite']}
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
        </div>
      </Container.Left2Third>
      <Container.Right1Third>
        <FlowWrapper key={project.id} columnMode>
          {flow && (
            <>
              <Flow flow={flow} readonly />
              <Toolbar bottom>
                <Toolbar.Fullscreen project={project} />
                <Toolbar.Zoom />
              </Toolbar>
            </>
          )}
        </FlowWrapper>

        <Card padded seamless transparent>
          <ListActivity orgId={params.org_id} projectId={project.id} />
        </Card>
      </Container.Right1Third>
    </Container>
  );
};
