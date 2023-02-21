import type { BlockLevelZero } from '../api';

export interface DBRevision {
  id: string;

  orgId: string;
  projectId: string;

  title: string;
  description: BlockLevelZero;
  blobs: string[];
  locked: boolean;
  status: 'approved' | 'closed' | 'draft' | 'rejected' | 'waiting';
  merged: boolean;

  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
}
