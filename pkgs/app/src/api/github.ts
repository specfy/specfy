import type {
  ListGitHubInstallations,
  ListGitHubRepos,
  PostLinkToGitHubOrg,
  PostLinkToGitHubProject,
} from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { qcli } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function linkToGitHubOrg(
  data: PostLinkToGitHubOrg['Body']
): Promise<PostLinkToGitHubOrg['Reply']> {
  const { res, json } = await fetchApi<PostLinkToGitHubOrg>(
    '/github/link_org',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['listOrgs']);
    void qcli.invalidateQueries(['getGithubRepos', data.installationId]);
  }

  return json;
}

export async function linkToGitHubRepo(
  data: PostLinkToGitHubProject['Body']
): Promise<PostLinkToGitHubProject['Reply']> {
  const { res, json } = await fetchApi<PostLinkToGitHubProject>(
    '/github/link_project',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    void qcli.invalidateQueries(['getProject']);
  }

  return json;
}

export function useGetGitHubInstallations() {
  return useQuery({
    queryKey: ['getGitHubInstallations'],
    queryFn: async (): Promise<ListGitHubInstallations['Success']['data']> => {
      const { json, res } = await fetchApi<ListGitHubInstallations>(
        '/github/installations'
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}

export function useGetGitHubRepos(
  qp: ListGitHubRepos['Querystring'],
  ready: boolean
) {
  return useQuery({
    queryKey: ['getGitHubRepos', qp.installation_id],
    enabled: ready,
    queryFn: async (): Promise<ListGitHubRepos['Success']['data']> => {
      const { json, res } = await fetchApi<ListGitHubRepos>('/github/repos', {
        qp,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}
