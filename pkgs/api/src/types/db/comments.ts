import type { BlockLevelZero } from '../api/index.js';

export type DBComment = {
  id: number;

  orgId: string;
  projectId: string;
  revisionId: string;
  userId: string;

  content: BlockLevelZero;

  createdAt: string;
  updatedAt: string;
};
