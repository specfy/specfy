// TODO: find a better spot
export interface SyncConfig {
  orgId: string;
  projectId: string;
  branch: string;
  documentation?: SyncConfigDocumentation;
  stack?: SyncConfigStack;
  git?: SyncConfigGit;
}
export interface SyncConfigDocumentation {
  enabled: boolean;
  path?: string;
}
export interface SyncConfigStack {
  enabled: boolean;
  path?: string;
}
export interface SyncConfigGit {
  enabled: boolean;
}

export type SyncConfigFull = {
  branch: string;
  documentation: Required<SyncConfigDocumentation>;
  stack: Required<SyncConfigStack>;
  git: Required<SyncConfigGit>;
};

export interface Commit {
  hash: string;
  author: string;
  email: string;
  date: Date;
}
export interface CommitAnalysis {
  info: Commit;
  techs: string[];
}
