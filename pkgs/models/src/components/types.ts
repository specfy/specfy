import type { AllowedKeys, TechType } from '@specfy/stack-analyser';

import type { BlockLevelZero } from '../documents';
import type { FlowEdge, FlowItemDisplay } from '../flows/types.js';

export type ComponentType = TechType | 'project' | 'service' | 'unknown';

export type InComponent = { id: string | null; source?: string | undefined };
export type ComponentTech = {
  id: AllowedKeys | 'unknown' | string;
  source?: string | undefined;
};
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
  techs: ComponentTech[];

  display: FlowItemDisplay;
  edges: FlowEdge[];

  inComponent: InComponent;

  source: string | null;
  sourceName: string | null;
  sourcePath: string[] | null;

  show: boolean;
  tags: string[];

  createdAt: string;
  updatedAt: string;
}
