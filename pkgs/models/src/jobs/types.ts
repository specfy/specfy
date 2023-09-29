import type { Jobs, Prisma } from '@specfy/db';

import type { ApiSource } from '../sources';

export interface JobDeployConfig {
  sourceId: string;
  url: string;
  autoLayout?: boolean;
  hook?: { id: string; ref: string };
  settings: ApiSource['settings'];
}
export type JobProjectIndexConfig = Record<string, never>;

export type JobWithOrgProject = Prisma.JobsGetPayload<{
  include: {
    Org: true;
    Project: {
      include: {
        Sources: { select: { id: true } };
      };
    };
    User: true;
  };
}>;

export type JobCode =
  | 'cant_auth_github'
  | 'failed_to_checkout'
  | 'failed_to_cleanup'
  | 'failed_to_clone'
  | 'failed_to_deploy'
  | 'failed_to_start_github_deployment'
  | 'failed_to_teardown'
  | 'missing_dependencies'
  | 'no_api_key'
  | 'org_not_installed'
  | 'project_not_installed'
  | 'success'
  | 'unknown'
  | 'sync_invalid_path'
  | 'too_many_documents'
  | 'failed_to_upload'
  | 'fail_safe_too_many_deletion';

export interface JobMark {
  status: Jobs['status'];
  code: JobCode;
  reason: string;
  err?: string | undefined;
}

export type JobReason = JobMark;

export type JobWithUser = Prisma.JobsGetPayload<{
  include: { User: true };
}>;

export type JobWithUserAndRevision = Prisma.JobsGetPayload<{
  include: {
    User: true;
    Revisions: { select: { id: true } };
  };
}>;
