import type { DBComponent } from '../db/components';

import type { Pagination } from './api';

export interface ApiComponent {
  id: string;
  orgId: string;
  projectId: string;

  type: DBComponent['type'];
  typeId: string | null;

  name: string;
  slug: string;
  description: string | null;
  tech: string[] | null;

  display: DBComponent['display'];
  inComponent: string | null;
  edges: DBComponent['edges'];

  createdAt: string;
  updatedAt: string;
}

// GET /
export interface ReqListComponents {
  org_id: string;
  project_id: string;
}

export interface ResListComponents {
  data: ApiComponent[];
  pagination: Pagination;
}
