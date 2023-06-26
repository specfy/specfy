import type { JobCode } from './type.js';

export const JobReason: Record<JobCode, string> = {
  org_not_installed: 'Specfy App is not installed on the Github organization',
  project_not_installed: 'Specfy App is not installed on the Github repository',
  cant_auth_github: "Can't authenticate to Github",
  missing_dependencies: 'Missing internal dependencies',
  failed_to_clone: 'Failed to clone repository',
  failed_to_cleanup: 'Failed to clean up',
  failed_to_deploy: 'Failed to deploy and analyze source code',
  failed_to_teardown: 'Failed to clean after execution',
  no_api_key: 'No API Key available to deploy',
  unknown: 'An unknown error occured',
  success: 'Success',
};
