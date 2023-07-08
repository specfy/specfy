import type { ApiMe, DeleteMe, GetMe, PutMe } from '@specfy/api/src/types/api';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function getMe(): Promise<ApiMe | null> {
  const { json, res } = await fetchApi<GetMe>('/me');

  return res.status !== 200 || isError(json) ? null : json.data;
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    queryFn: async (): Promise<GetMe['Success']['data']> => {
      const { json, res } = await fetchApi<GetMe>('/me');

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}

export async function updateMe(data: PutMe['Body']): Promise<PutMe['Reply']> {
  const { json, res } = await fetchApi<PutMe>(`/me`, { body: data }, 'PUT');

  if (res.status === 200) {
    void queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function deleteMe(): Promise<number> {
  const { res } = await fetchApi<DeleteMe>(`/me`, undefined, 'DELETE');

  return res.status;
}
