import { useQuery } from '@tanstack/react-query';
import type {
  ListGithubInstallations,
  ListGithubRepos,
  PostLinkToGithubOrg,
  PostLinkToGithubProject,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function linkToGithubOrg(
  data: PostLinkToGithubOrg['Body']
): Promise<PostLinkToGithubOrg['Reply']> {
  const { res, json } = await fetchApi<PostLinkToGithubOrg>(
    '/github/link_org',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function linkToGithubRepo(
  data: PostLinkToGithubProject['Body']
): Promise<PostLinkToGithubProject['Reply']> {
  const { res, json } = await fetchApi<PostLinkToGithubProject>(
    '/github/link_project',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export function useGetGithubInstallations() {
  return useQuery({
    queryKey: ['getGithubInstallations'],
    queryFn: async (): Promise<ListGithubInstallations['Success']['data']> => {
      const { json, res } = await fetchApi<ListGithubInstallations>(
        '/github/installations'
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}

export function useGetGithubRepos(
  qp: ListGithubRepos['Querystring'],
  ready: boolean
) {
  return useQuery({
    queryKey: ['getGithubRepos', qp.installation_id],
    enabled: ready,
    queryFn: async (): Promise<ListGithubRepos['Success']['data']> => {
      const { json, res } = await fetchApi<ListGithubRepos>('/github/repos', {
        qp,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}
