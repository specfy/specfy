import type { DBOrg } from '../db/orgs';

import type { ResErrors } from './api';

export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'>;

export interface ResListOrgsSuccess {
  data: ApiOrg[];
}
export type ResListOrgs = ResErrors | ResListOrgsSuccess;

// POST /
export type ReqPostOrg = Pick<ApiOrg, 'id' | 'name'>;
export type ResPostOrgSuccess = ApiOrg;
export type ResPostOrg = ResErrors | ResPostOrgSuccess;
