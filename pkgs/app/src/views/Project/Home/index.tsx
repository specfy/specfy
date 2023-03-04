import { Typography } from 'antd';
import type { BlockLevelZero } from 'api/src/types/api';
import { useCallback, useEffect } from 'react';

import { useProjectStore } from '../../../common/store';
import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { Graph, GraphContainer } from '../../../components/Graph';
import { Toolbar } from '../../../components/Graph/Toolbar';
import { ListActivity } from '../../../components/ListActivity';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import { useGraph } from '../../../hooks/useGraph';
import type { RouteProject } from '../../../types/routes';

import { Team } from './Team';
import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

export const ProjectHome: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const gref = useGraph();
  const edit = useEdit();
  const isEditing = edit.isEnabled();

  const { update, project } = useProjectStore();

  useEffect(() => {
    if (!gref) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight(true);
    }, 500);
  }, []);

  const onUpdate = useCallback((doc: BlockLevelZero) => {
    update({ ...project!, description: doc });
  }, []);

  return (
    <>
      <Container.Left>
        <Card padded>
          <Typography>
            {!isEditing && <ContentDoc doc={project!.description} />}
            {isEditing && (
              <EditorMini doc={project!.description} onUpdate={onUpdate} />
            )}
          </Typography>

          <div className={cls.block}>
            <Typography.Title level={5}>Technical Aspect</Typography.Title>
            <TechnicalAspects params={params} />
          </div>

          <div className={cls.block}>
            <Typography.Title level={5}>Team</Typography.Title>
            <Team org_id={params.org_id} project_id={project!.id} />
          </div>
        </Card>

        <Card padded>
          <ListRFCs project={project!}></ListRFCs>
        </Card>
        <Card padded>
          <ListActivity orgId={params.org_id} />
        </Card>
      </Container.Left>
      <Container.Right>
        <Card>
          <GraphContainer>
            <Graph readonly={true} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>
      </Container.Right>
    </>
  );
};
