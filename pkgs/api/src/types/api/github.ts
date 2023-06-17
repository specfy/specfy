import type { ResErrors } from './api';

// GET /github/repos
export interface ApiGithubRepo {
  id: number;
  name: string;
  url: string;
  private: boolean;
}
export interface ReqGetGithubRepos {
  installation_id?: number;
}
export interface ResGetGithubReposSuccess {
  data: ApiGithubRepo[];
}
export type ResGetGithubRepos = ResErrors | ResGetGithubReposSuccess;

// GET /github/installations
export interface ApiGithubInstallation {
  id: number;
  name: string;
  avatarUrl: string;
  url: string;
}
export interface ResGetGithubInstallationsSuccess {
  data: ApiGithubInstallation[];
}
export type ResGetGithubInstallations =
  | ResErrors
  | ResGetGithubInstallationsSuccess;

// GET /github/members
export interface ApiGithubMember {
  id: number;
  name: string;
  avatarUrl: string;
  url: string;
}
export interface ReqGetGithubMembers {
  org: string;
}
export interface ResGetGithubMembersSuccess {
  data: ApiGithubMember[];
}
export type ResGetGithubMembers = ResErrors | ResGetGithubMembersSuccess;
