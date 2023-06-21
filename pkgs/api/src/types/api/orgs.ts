import type { DBOrg } from '../db/orgs';

import type { Res } from './api';

export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'> & {
  githubInstallationId: number | null;
};
export interface ReqOrgParams {
  org_id: string;
}

// GET /
export type ListOrgs = Res<{
  Success: {
    data: ApiOrg[];
  };
}>;

// POST /
export type PostOrg = Res<{
  Body: Pick<ApiOrg, 'id' | 'name'>;
  Success: ApiOrg;
}>;

// PUT /:org_id
export type PutOrg = Res<{
  Params: ReqOrgParams;
  Body: {
    name: string;
  };
  Success: { data: ApiOrg };
}>;

// DELETE /:org_id
export type DeleteOrg = Res<{
  Params: ReqOrgParams;
  Success:
    | never
    | {
        error: {
          code: 'cant_delete';
          reason: 'is_personal';
        };
      };
}>;
