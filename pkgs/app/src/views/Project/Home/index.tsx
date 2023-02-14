import { Card, Col, Row, Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useMemo } from 'react';

import { ContentDoc } from '../../../components/Content';
import { EditorMini } from '../../../components/Editor/Mini';
import { ListActivity } from '../../../components/ListActivity';
import { ListRFCs } from '../../../components/ListRFCs';
import { useEdit } from '../../../hooks/useEdit';
import type { RouteProject } from '../../../types/routes';

import { Team } from './Team';
import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

export const ProjectHome: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  const edit = useEdit();
  const curr = useMemo(() => {
    return edit.get<ApiProject>('project', proj.id, proj);
  }, [edit.isEnabled]);
  const desc = useMemo(() => {
    return curr?.edits?.description || proj.description;
  }, [proj, curr]);

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            {!edit.isEnabled && <ContentDoc doc={desc} />}
            {edit.isEnabled && (
              <EditorMini
                curr={curr!}
                field="description"
                originalContent={proj.description}
              />
            )}

            <div className={cls.block}>
              <Typography.Title level={5}>Technical Aspect</Typography.Title>
              {comps ? (
                <TechnicalAspects
                  components={comps}
                  orgId={params.org_id}
                  slug={params.project_slug}
                />
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
        </Col>

        <Col span={15}>
          <Card>
            <ListRFCs project={proj}></ListRFCs>
          </Card>
        </Col>
        <Col span={9}>
          <Card>
            <ListActivity
              orgId={params.org_id}
              projectSlug={params.project_slug}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
