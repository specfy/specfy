import type { Prisma } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';

import type { BlockLevelZero } from '../documents';

export interface DBRevision {
  id: string;

  orgId: string;
  projectId: string;

  name: string;
  description: BlockLevelZero;
  blobs: string[];
  stack: AnalyserJson | null;
  locked: boolean;
  status: 'approved' | 'closed' | 'draft' | 'waiting';
  merged: boolean;

  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  closedAt: string | null;
}

export type RevisionWithProject = Prisma.RevisionsGetPayload<{
  include: { Project: true; TypeHasUsers: { include: { User: true } } };
}>;
