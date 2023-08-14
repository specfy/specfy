import type { Pagination, Res } from '@specfy/core';
import type { ConfigDocumentation, ConfigStack } from '@specfy/sync';
import type { DBProject } from './types.js';
export type ApiProject = DBProject;
export type ApiProjectList = Omit<ApiProject, 'blobId' | 'config' | 'description' | 'links'> & {
    users: number;
};
export interface ReqProjectParams {
    org_id: string;
    project_slug: string;
}
export type ListProjects = Res<{
    Querystring: {
        org_id: string;
    };
    Success: {
        data: ApiProjectList[];
        pagination: Pagination;
    };
}>;
export type PostProject = Res<{
    Body: Pick<ApiProject, 'name' | 'orgId'> & {
        config?: {
            branch?: string | undefined;
            documentation?: ConfigDocumentation | undefined;
            stack?: ConfigStack | undefined;
        } | undefined;
    };
    Success: {
        data: Pick<ApiProject, 'id' | 'slug'>;
    };
}>;
export type GetProject = Res<{
    Params: ReqProjectParams;
    Success: {
        data: ApiProject;
    };
}>;
export type PutProject = Res<{
    Params: ReqProjectParams;
    Body: Pick<ApiProject, 'name' | 'slug'>;
    Success: {
        data: ApiProject;
    };
}>;
export type DeleteProject = Res<{
    Params: ReqProjectParams;
    Success: never;
}>;
