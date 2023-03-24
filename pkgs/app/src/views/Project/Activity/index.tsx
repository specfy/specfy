import type { ApiProject } from 'api/src/types/api';

import { Container } from '../../../components/Container';
import { ListActivity } from '../../../components/ListActivity';
import type { RouteProject } from '../../../types/routes';

export const ProjectActivity: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  return (
    <Container>
      <ListActivity orgId={params.org_id} projectId={proj.id} />
    </Container>
  );
};
