import type { Prisma } from '@prisma/client';

export interface JobDeploy {
  url: string;
}

export type JobWithOrgProject = Prisma.JobsGetPayload<{
  include: { Org: true; Project: true };
}>;

export enum JobReason {
  'org_not_installed' = 'Specfy App is not installed on the Github organization',
  'project_not_installed' = 'Specfy App is not installed on the Github repository',
  'cant_auth_github' = "Can't authenticate to Github",
  'missing_dependencies' = 'Missing internal dependencies',
  'unknown' = 'An unknown error occured',
}
