import { Helmet } from 'react-helmet-async';

import type { ApiProject } from '@specfy/models';

import { titleSuffix } from '@/common/string';
import { Container, ContainerChild } from '@/components/Container';
import { ListActivity } from '@/components/ListActivity';
import type { RouteProject } from '@/types/routes';

export const ProjectActivity: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  return (
    <Container noPadding>
      <Helmet title={`Activity - ${proj.name} ${titleSuffix}`} />
      <ContainerChild leftLarge padded>
        <ListActivity orgId={params.org_id} projectId={proj.id} />
      </ContainerChild>
    </Container>
  );
};
