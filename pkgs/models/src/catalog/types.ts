import type { ComponentType } from '../components/index.js';

export interface CatalogTech {
  orgId: string;
  projectId: string;
  jobId: string;
  type: ComponentType | 'unknown';
  key: string;
  name: string;
}
