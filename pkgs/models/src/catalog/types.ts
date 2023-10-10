import type { ComponentType } from '../components/index.js';

export interface CatalogTech {
  orgId: string;
  projectId: string;
  jobId: string;
  type: ComponentType;
  key: string;
  name: string;
}
