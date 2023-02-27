import type { ApiProject, ApiComponent } from 'api/src/types/api';

import { Card } from '../../../components/Card';
import { Graph } from '../../../components/Graph';
import type { RouteProject } from '../../../types/routes';

export const ProjectGraph: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  return (
    <div>
      <Card>
        <div
          style={{
            width: 'calc(100vw - 24px * 2)',
            height: 'calc(100vh - 200px)',
          }}
        >
          <Graph components={comps} />
        </div>
      </Card>
    </div>
  );
};
