import { useQuery } from '@tanstack/react-query';
import type {
  ApiMe,
  ReqPutMe,
  ResDeleteMe,
  ResGetMe,
  ResGetMeSuccess,
  ResPutMe,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export async function getMe(): Promise<ApiMe | null> {
  const { json, res } = await fetchApi<ResGetMe>('/me');

  return res.status !== 200 || isError(json) ? null : json.data;
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    queryFn: async (): Promise<ResGetMeSuccess['data']> => {
      const { json, res } = await fetchApi<ResGetMe>('/me');

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json.data;
    },
  });
}

export async function updateMe(data: ReqPutMe): Promise<ResPutMe> {
  const { json, res } = await fetchApi<ResPutMe, undefined, ReqPutMe>(
    `/me`,
    { body: data },
    'PUT'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listOrgs']);
  }

  return json;
}

export async function deleteMe(): Promise<number> {
  const { res } = await fetchApi<ResDeleteMe>(`/me`, undefined, 'DELETE');

  return res.status;
}
