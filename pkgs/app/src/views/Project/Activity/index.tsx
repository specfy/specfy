import type { ApiProject } from 'api/src/types/api';

import { Card } from '../../../components/Card';
import { ListActivity } from '../../../components/ListActivity';
import type { RouteProject } from '../../../types/routes';

export const ProjectActivity: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params }) => {
  return (
    <Card padded>
      <ListActivity orgId={params.org_id} />
    </Card>
  );
};
