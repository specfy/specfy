import type { TechType } from '@specfy/stack-analyser';

export interface CatalogTechIndex {
  orgId: string;
  projectId: string;
  jobId: string;
  type: TechType | 'unknown';
  key: string;
  name: string;
}

export interface CommitIndex {
  orgId: string;
  projectId: string;
  sourceId: string;
  userId: string | null;
  username: string;
  hash: string;
  techs: string[];
  date: string;
}
