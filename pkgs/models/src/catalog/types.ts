import type { TechType } from '@specfy/stack-analyser';

export interface CatalogTech {
  orgId: string;
  projectId: string;
  jobId: string;
  type: TechType | 'unknown';
  key: string;
  name: string;
}
