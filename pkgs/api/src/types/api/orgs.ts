import type { DBOrg } from '../db/orgs';

export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'>;

export interface ResListOrgs {
  data: ApiOrg[];
}
