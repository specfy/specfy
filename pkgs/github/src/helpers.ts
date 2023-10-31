import { github } from './app.js';

export async function getTemporaryToken({
  installationId,
  repo,
}: {
  installationId: number;
  repo: string;
}): Promise<string> {
  // Acquire a special short lived token that allow us to clone the repository
  const auth = await github.octokit.rest.apps.createInstallationAccessToken({
    installation_id: installationId,
    repositories: [repo],
    permissions: {
      environments: 'write',
      statuses: 'write',
      deployments: 'write',
      contents: 'read',
    },
  });
  return auth.data.token;
}
