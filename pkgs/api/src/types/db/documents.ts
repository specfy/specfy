import type { BlockLevelZero } from '../api';

export interface DBDocument {
  id: string;
  orgId: string;
  projectId: string;
  blobId: string;

  type: 'rfc';
  typeId: number;

  name: string;
  slug: string;
  tldr: string;
  content: BlockLevelZero;
  status: 'approved' | 'draft' | 'rejected' | 'waiting';
  locked: boolean;

  createdAt: string;
  updatedAt: string;
}
