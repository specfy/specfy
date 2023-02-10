import type { ApiProject } from 'api/src/types/api';

import { Container } from '../../../components/Container';
import type { RouteProject } from '../../../types/routes';

export const ProjectRevisions: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  return <Container>hello</Container>;
};
