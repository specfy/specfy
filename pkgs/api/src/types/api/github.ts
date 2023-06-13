import type { ResErrors } from './api';

// GET /github/repos
export interface ApiGithubRepo {
  id: number;
  name: string;
  url: string;
  private: boolean;
}
export interface ResGetGithubReposSuccess {
  data: ApiGithubRepo[];
}
export type ResGetGithubRepos = ResErrors | ResGetGithubReposSuccess;

// GET /github/installations
export interface ApiGithubInstallation {
  id: number;
  name: string;
  avatar: string;
  url: string;
}
export interface ResGetGithubInstallationsSuccess {
  data: ApiGithubInstallation[];
}
export type ResGetGithubInstallations =
  | ResErrors
  | ResGetGithubInstallationsSuccess;
