import type { JobCode } from './types.js';

export const jobReason: Record<JobCode, string> = {
  org_not_installed: 'Specfy App is not installed on the Github organization',
  project_not_installed: 'Specfy App is not installed on the Github repository',
  cant_auth_github: "Can't authenticate to Github",
  missing_dependencies: 'Missing internal dependencies',
  failed_to_clone: 'Failed to clone repository',
  failed_to_cleanup: 'Failed to clean up',
  failed_to_deploy: 'Failed to deploy and analyze source code',
  failed_to_teardown: 'Failed to clean after execution',
  failed_to_checkout: 'Failed to checkout repository at the commit ref',
  failed_to_start_github_deployment: 'Failed to reach Github deployment API',
  no_api_key: 'No API Key available to deploy',
  unknown: 'An unknown error occured',
  success: 'Success',
};
