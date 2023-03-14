import { LinkOutlined } from '@ant-design/icons';
import { IconBrandGithub, IconBrandSlack } from '@tabler/icons-react';
import { Typography } from 'antd';
import type { ApiComponent, BlockLevelZero } from 'api/src/types/api';
import { useCallback, useEffect, useState } from 'react';

import { useComponentsStore, useProjectStore } from '../../../common/store';
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

export const ProjectOverview: React.FC<{
  params: RouteProject;
}> = ({ params }) => {
  const gref = useGraph();
  const edit = useEdit();
  const storeComponents = useComponentsStore();
  const { update, project } = useProjectStore();

  const [components, setComponents] = useState<ApiComponent[]>();
  const isEditing = edit.isEnabled();

  useEffect(() => {
    if (!gref) {
      return;
    }

    setTimeout(() => {
      gref.recenter();
      gref.unsetHighlight(true);
    }, 500);
  }, []);
  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

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
              <EditorMini doc={project.description} onUpdate={onUpdate} />
            )}
          </Typography>

          {project.links.length > 0 && (
            <div className={cls.links}>
              {project.links.map((link) => {
                let icon = <LinkOutlined />;
                if (link.title === 'Github') icon = <IconBrandGithub />;
                else if (link.title === 'Slack') icon = <IconBrandSlack />;

                return (
                  <a
                    key={link.link}
                    className={cls.link}
                    href={link.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon} {link.title}
                  </a>
                );
              })}
            </div>
          )}

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
        <Card>
          <GraphContainer>
            <Graph readonly={true} components={components!} />
            <Toolbar position="bottom">
              <Toolbar.Zoom />
            </Toolbar>
          </GraphContainer>
        </Card>

        <ListActivity orgId={params.org_id} />
      </Container.Right>
    </Container>
  );
};
