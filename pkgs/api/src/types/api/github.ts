import type { Res } from './api';

// GET /github/repos
export interface ApiGithubRepo {
  id: number;
  name: string;
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
