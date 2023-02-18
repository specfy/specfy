import type { BlockLevelZero } from '../api';

export interface DBRevision {
  id: string;

  orgId: string;
  projectId: string;

  title: string;
  description: BlockLevelZero;
  blobs: string[];
  locked: boolean;

  createdAt: string;
  updatedAt: string;
}
