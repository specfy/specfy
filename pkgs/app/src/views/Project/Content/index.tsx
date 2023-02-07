import { Card } from 'antd';
import type { ApiProject } from 'api/src/types/api';

import { ListRFCs } from '../../../components/ListRFCs';
import type { RouteProject } from '../../../types/routes';

export const ProjectContent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj }) => {
  return (
    <Card>
      <ListRFCs project={proj}></ListRFCs>
    </Card>
  );
};
