import type { Res } from '@specfy/core';
import type { DBOrg } from './types.js';
export type ApiOrg = Omit<DBOrg, 'createdAt' | 'updatedAt'> & {
    githubInstallationId: number | null;
};
export type ApiOrgPublic = Omit<DBOrg, 'createdAt' | 'flowId' | 'updatedAt'>;
export interface ReqOrgParams {
    org_id: string;
}
export type ListOrgs = Res<{
    Success: {
        data: ApiOrg[];
    };
}>;
export type PostOrg = Res<{
    Body: Pick<ApiOrg, 'id' | 'name'>;
    Success: {
        data: ApiOrgPublic;
    };
}>;
export type PutOrg = Res<{
    Params: ReqOrgParams;
    Body: {
        name: string;
    };
    Success: {
        data: ApiOrgPublic;
    };
}>;
export type DeleteOrg = Res<{
    Params: ReqOrgParams;
    Success: never;
}>;
