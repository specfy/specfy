import type { BlockLevelZero } from '../api';

import type { GraphEdge, GraphItemDisplay } from './graph';

export interface DBComponent {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string;
  techId: string | null;

  type: 'component' | 'hosting' | 'project' | 'thirdparty';
  typeId: string | null;

  name: string;
  slug: string;
  description: BlockLevelZero;
  tech: string[] | null;

  display: GraphItemDisplay;
  edges: GraphEdge[];

  inComponent: string | null;

  createdAt: string;
  updatedAt: string;
}
