import { useQuery } from '@tanstack/react-query';
import type {
  ReqGetGithubRepos,
  ResGetGithubInstallations,
  ResGetGithubInstallationsSuccess,
  ResGetGithubRepos,
  ResGetGithubReposSuccess,
} from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useGetGithubInstallations() {
  return useQuery({
    queryKey: ['getGithubInstallations'],
    queryFn: async (): Promise<ResGetGithubInstallationsSuccess['data']> => {
      const { json, res } = await fetchApi<ResGetGithubInstallations>(
        '/github/installations'
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}

export function useGetGithubRepos(qp: ReqGetGithubRepos, ready: boolean) {
  return useQuery({
    queryKey: ['getGithubRepos', qp.installation_id],
    enabled: ready,
    queryFn: async (): Promise<ResGetGithubReposSuccess['data']> => {
      const { json, res } = await fetchApi<
        ResGetGithubRepos,
        ReqGetGithubRepos
      >('/github/repos', {
        qp,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}
