import type { BlockLevelZero } from '../api/index.js';

import type { FlowEdge, FlowItemDisplay } from './flow.js';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string | null;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];

  display: FlowItemDisplay;
  edges: FlowEdge[];

  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  url: string;
}
