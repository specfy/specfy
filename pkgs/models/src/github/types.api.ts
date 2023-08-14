import type { Res } from '@specfy/core';

// GET /github/repos
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

// GET /github/installations
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

// GET /github/members
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

// POST /github/link_org
export type PostLinkToGithubOrg = Res<{
  Body: {
    orgId: string;
    installationId: number | null;
  };
  Success: {
    done: true;
  };
}>;

// POST /github/link_project
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

// POST /github/webhooks
export type PostGithubWebhook = Res<{
  Body: any;
  Success: {
    done: true;
  };
}>;
