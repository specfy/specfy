import type { BlockLevelZero } from '../api/index.js';

import type { FlowEdge, FlowItemDisplay } from './flow.js';

export interface DBComponent {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string | null;
  techId: string | null;

  type: 'component' | 'hosting' | 'project' | 'thirdparty';
  // Only useful for project
  typeId: string | null;

  name: string;
  slug: string;
  description: BlockLevelZero;
  tech: string[];

  display: FlowItemDisplay;
  edges: FlowEdge[];

  inComponent: string | null;

  source: string | null;
  sourceName: string | null;
  sourcePath: string[] | null;

  createdAt: string;
  updatedAt: string;
}
