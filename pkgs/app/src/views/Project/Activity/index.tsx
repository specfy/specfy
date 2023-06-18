import type { ApiProject } from 'api/src/types/api';
import { Helmet } from 'react-helmet-async';

import { titleSuffix } from '../../../common/string';
import { Container } from '../../../components/Container';
import { ListActivity } from '../../../components/ListActivity';
import type { RouteProject } from '../../../types/routes';

export const ProjectActivity: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  return (
    <Container>
      <Helmet title={`Activity - ${proj.name} ${titleSuffix}`} />
      <ListActivity orgId={params.org_id} projectId={proj.id} />
    </Container>
  );
};
