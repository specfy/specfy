// TODO: find a better spot
export interface SyncConfig {
  orgId: string;
  projectId: string;
  branch: string;
  documentation?: SyncConfigDocumentation;
  stack?: SyncConfigStack;
}
export interface SyncConfigDocumentation {
  enabled: boolean;
  path?: string;
}
export interface SyncConfigStack {
  enabled: boolean;
  path?: string;
}

export const def: SyncConfig = {
  orgId: '',
  projectId: '',
  branch: 'main',
  documentation: {
    enabled: true,
    path: 'docs/',
  },
  stack: {
    enabled: true,
    path: '/',
  },
};
