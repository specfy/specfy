import type { DBOrg } from '../db/orgs';

export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'>;

export interface ResListOrgs {
  data: ApiOrg[];
}

// POST /
export type ReqPostOrg = Pick<ApiOrg, 'id' | 'name'>;
export type ResPostOrg = ApiOrg;
