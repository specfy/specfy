import { Card } from '../../../components/Card';
import { Container } from '../../../components/Container';
import { ListActivity } from '../../../components/ListActivity';
import { ListProjects } from '../../../components/ListProjects';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgOverview: React.FC<{ params: RouteOrg }> = ({ params }) => {
  return (
    <>
      <Container.Left>
        <Card padded>
          <ListProjects></ListProjects>
        </Card>
      </Container.Left>
      <Container.Right>
        <Card padded>
          <ListActivity orgId={params.org_id}></ListActivity>
        </Card>
      </Container.Right>
    </>
  );
};
