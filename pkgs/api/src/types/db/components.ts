import type { TechType } from '@specfy/stack-analyser';

import type { BlockLevelZero } from '../api/index.js';

import type { FlowEdge, FlowItemDisplay } from './flow.js';

export type ComponentType = TechType | 'project' | 'service';

export interface DBComponent {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string | null;
  techId: string | null;

  type: ComponentType;
  // Only useful for project
  typeId: string | null;

  name: string;
  slug: string;
  description: BlockLevelZero;
  techs: string[];
  tags: string[];

  display: FlowItemDisplay;
  edges: FlowEdge[];

  inComponent: string | null;

  source: string | null;
  sourceName: string | null;
  sourcePath: string[] | null;

  show: boolean;

  createdAt: string;
  updatedAt: string;
}
