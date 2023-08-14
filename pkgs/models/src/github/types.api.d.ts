import type { Res } from '@specfy/core';
export interface ApiGithubRepo {
    id: number;
    name: string;
    fullName: string;
    url: string;
    private: boolean;
}
export type ListGithubRepos = Res<{
    Querystring: {
        installation_id?: number;
    };
    Success: {
        data: ApiGithubRepo[];
    };
}>;
export interface ApiGithubInstallation {
    id: number;
    name: string;
    avatarUrl: string;
    url: string;
}
export type ListGithubInstallations = Res<{
    Success: {
        data: ApiGithubInstallation[];
    };
}>;
export interface ApiGithubMember {
    id: number;
    name: string;
    avatarUrl: string;
    url: string;
}
export type GetGithubMembers = Res<{
    Querystring: {
        org: string;
    };
    Success: {
        data: ApiGithubMember[];
    };
}>;
export type PostLinkToGithubOrg = Res<{
    Body: {
        orgId: string;
        installationId: number | null;
    };
    Success: {
        done: true;
    };
}>;
export type PostLinkToGithubProject = Res<{
    Body: {
        orgId: string;
        projectId: string;
        repository: string | null;
    };
    Success: {
        done: true;
    };
}>;
export type PostGithubWebhook = Res<{
    Body: any;
    Success: {
        done: true;
    };
}>;
