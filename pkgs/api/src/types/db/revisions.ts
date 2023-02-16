import type { BlockLevelZero } from '../api';

export interface DBRevision {
  id: string;
  parentId: string | null;
  orgId: string;
  projectId: string;
  title: string;
  description: BlockLevelZero;
  changes: RevisionChange[];
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RevisionChange = RevisionContent | RevisionTeam;

export interface RevisionContent {
  type: 'component' | 'graph' | 'project' | 'rfc';
  deleted?: true;
  id: string;
  values: Record<string, any>;
}

export interface RevisionTeam {
  type: 'team';
  added: string[];
  removed: string[];
}
