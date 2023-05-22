import type { DBOrg } from '../db/orgs';

import type { ResErrors } from './api';

export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'> & { logo: string };

export interface ResListOrgsSuccess {
  data: ApiOrg[];
}
export type ResListOrgs = ResErrors | ResListOrgsSuccess;

// POST /
export type ReqPostOrg = Pick<ApiOrg, 'id' | 'name'>;
export type ResPostOrgSuccess = ApiOrg;
export type ResPostOrg = ResErrors | ResPostOrgSuccess;

// GET /:org_id
export interface ReqOrgParams {
  org_id: string;
}

// PUT /:org_id
export type ReqPutOrg = {
  name: string;
};
export type ResPutOrgSuccess = { data: ApiOrg };
export type ResPutOrg = ResErrors | ResPutOrgSuccess;

// DELETE /:org_id
export type ResDeleteOrgSuccess = never;
export type ResDeleteOrg = ResDeleteOrgSuccess | ResErrors;
