import { Card } from 'antd';
import type { ApiProject } from 'api/src/types/api';

import { ListActivity } from '../../../components/ListActivity';
import type { RouteProject } from '../../../types/routes';

export const ProjectActivity: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params }) => {
  return (
    <Card>
      <ListActivity orgId={params.org_id} projectSlug={params.project_slug} />
    </Card>
  );
};
