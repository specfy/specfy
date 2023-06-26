import type { Prisma } from '@prisma/client';

export interface JobDeployConfig {
  url: string;
}

export type JobWithOrgProject = Prisma.JobsGetPayload<{
  include: { Org: true; Project: true };
}>;

export type JobCode =
  | 'cant_auth_github'
  | 'failed_to_cleanup'
  | 'failed_to_clone'
  | 'failed_to_deploy'
  | 'failed_to_teardown'
  | 'missing_dependencies'
  | 'no_api_key'
  | 'org_not_installed'
  | 'project_not_installed'
  | 'success'
  | 'unknown';
