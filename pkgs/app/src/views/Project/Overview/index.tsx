import type { ApiComponent, BlockLevelZero } from '@specfy/models';
import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useCallback, useEffect, useState } from 'react';

import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import {
  ContentDoc,
  Placeholder,
  Presentation,
} from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { ListActivity } from '../../../components/ListActivity';
import { ProjectLinks } from '../../../components/Project/Links';
import { TeamSummary } from '../../../components/Team/Summary';
import { UpdatedAt } from '../../../components/UpdatedAt';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

import {
  useComponentsStore,
  useFlowStore,
  useProjectStore,
} from '@/common/store';
import { FlowV2 } from '@/components/Flow/FlowV2';
import { Editable } from '@/components/Form/Editable';

export const ProjectOverview: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const edit = useEdit();
  const storeFlow = useFlowStore();
  const storeComponents = useComponentsStore();
  const { update, project } = useProjectStore();

  const [components, setComponents] = useState<ApiComponent[]>();
  const isEditing = edit.isEditing;

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      return;
    }

    storeFlow.setCurrent(project!.id, componentsToFlow(components));
    storeFlow.setMeta({ readOnly: true });
    storeFlow.setHighlight(null);
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
              <Editable padded>
                <Presentation>
                  <ContentDoc
                    doc={project.description}
                    placeholder={
                      <Placeholder text="Write something about this project, why it exists, what does it do and how" />
                    }
                  />
                </Presentation>
              </Editable>
            )}
            {isEditing && (
              <EditorMini
                key={project.id}
                doc={project.description}
                aiTools={['project.description', 'rewrite']}
                onUpdate={onUpdate}
                placeholder="Write something about this project, why it exists, what does it do and how"
              />
            )}
          </div>

          <ProjectLinks />

          {components && components.length > 0 && (
            <div className={cls.block}>
              <h2>Technical Stack</h2>
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
          <FlowV2 />
          <Toolbar bottom>
            <Toolbar.Fullscreen to={`${project.orgId}/${project.slug}`} />
            <Toolbar.Zoom />
          </Toolbar>
        </FlowWrapper>

        <Card padded seamless transparent>
          <ListActivity orgId={params.org_id} projectId={project.id} />
        </Card>
      </Container.Right1Third>
    </Container>
  );
};
