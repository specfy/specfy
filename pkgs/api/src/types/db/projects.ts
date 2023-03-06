import type { BlockLevelZero } from '../api';

import type { GraphEdge, GraphItemDisplay } from './graph';

export interface DBProject {
  id: string;
  orgId: string;
  blobId: string;
  slug: string;
  name: string;
  description: BlockLevelZero;
  links: DBProjectLink[];

  display: GraphItemDisplay;
  edges: GraphEdge[];

  createdAt: string;
  updatedAt: string;
}

export interface DBProjectLink {
  title: string;
  link: string;
}
