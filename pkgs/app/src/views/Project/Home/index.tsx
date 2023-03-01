import { Typography } from 'antd';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import { useEffect, useMemo } from 'react';

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
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  const gref = useGraph();
  const edit = useEdit();

  const curr = useMemo(() => {
    return edit.get<ApiProject>('project', proj.id, proj);
  }, [edit.isEnabled]);
  const desc = useMemo(() => {
    return curr?.changes?.description || proj.description;
  }, [proj, curr]);

  useEffect(() => {
    if (!gref) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight(true);
    }, 500);
  }, []);

  return (
    <>
      <Container.Left>
        <Card padded>
          <Typography>
            {!edit.isEnabled() && <ContentDoc doc={desc} />}
            {edit.isEnabled() && (
              <EditorMini
                curr={curr!}
                field="description"
                originalContent={proj.description}
              />
            )}
          </Typography>

          <div className={cls.block}>
            <Typography.Title level={5}>Technical Aspect</Typography.Title>
            {comps ? (
              <TechnicalAspects components={comps} params={params} />
            ) : (
              <Typography.Text type="secondary">
                Nothing to show.
              </Typography.Text>
            )}
          </div>

          <div className={cls.block}>
            <Typography.Title level={5}>Team</Typography.Title>
            <Team org_id={params.org_id} project_id={proj.id} />
          </div>
        </Card>

        <Card>
          <ListRFCs project={proj}></ListRFCs>
        </Card>
        <Card>
          <ListActivity
            orgId={params.org_id}
            projectSlug={params.project_slug}
          />
        </Card>
      </Container.Left>
      <Container.Right>
        <Card>
          <GraphContainer>
            <Graph components={comps} readonly={true} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>
      </Container.Right>
    </>
  );
};
