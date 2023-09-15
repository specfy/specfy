import type { JobCode } from './types.js';

export const jobReason: Record<JobCode, string> = {
  org_not_installed: 'Specfy App is not installed on the GitHub organization',
  project_not_installed: 'Specfy App is not installed on the GitHub repository',
  cant_auth_github: "Can't authenticate to GitHub",
  missing_dependencies: 'Missing internal dependencies',
  failed_to_clone: 'Failed to clone repository',
  failed_to_cleanup: 'Failed to clean up',
  failed_to_deploy: 'Failed to deploy and analyze source code',
  failed_to_teardown: 'Failed to clean after execution',
  failed_to_checkout: 'Failed to checkout repository at the commit ref',
  failed_to_start_github_deployment: 'Failed to reach GitHub deployment API',
  failed_to_upload: 'Failed to upload to Specfy API',
  sync_invalid_path:
    'A path set in the configuration does not exists on this repository',
  no_api_key: 'No API Key available to deploy',
  unknown: 'An unknown error occured',
  success: 'Success',
  fail_safe_too_many_deletion:
    'Deploy was successful, but requires the deletion of more than 1 resources. You can merge manually to resolve this issue.',
  too_many_documents:
    'Too many documents uploaded, check the logs and your plan limits or disable documentation upload',
};
