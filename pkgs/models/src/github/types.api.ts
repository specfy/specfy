import type { Res } from '@specfy/core';

// GET /github/repos
export interface ApiGitHubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  private: boolean;
}
export type ListGitHubRepos = Res<{
  Querystring: {
    installation_id?: number;
  };
  Success: {
    data: ApiGitHubRepo[];
  };
}>;

// GET /github/installations
export interface ApiGitHubInstallation {
  id: number;
  name: string;
  avatarUrl: string;
  url: string;
}
export type ListGitHubInstallations = Res<{
  Success: {
    data: ApiGitHubInstallation[];
  };
}>;

// GET /github/members
export interface ApiGitHubMember {
  id: number;
  name: string;
  avatarUrl: string;
  url: string;
}
export type GetGitHubMembers = Res<{
  Querystring: {
    org: string;
  };
  Success: {
    data: ApiGitHubMember[];
  };
}>;

// POST /github/link_org
export type PostLinkToGitHubOrg = Res<{
  Body: {
    orgId: string;
    installationId: number | null;
  };
  Success: {
    done: true;
  };
}>;

// POST /github/link_project
export type PostLinkToGitHubProject = Res<{
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
export type PostGitHubWebhook = Res<{
  Body: any;
  Success: {
    done: true;
  };
}>;
