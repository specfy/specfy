import { useQuery } from '@tanstack/react-query';
import type {
  ApiMe,
  ReqListUsers,
  ResGetMe,
  ResGetMeSuccess,
  ResListUsers,
  ResListUsersSuccess,
} from 'api/src/types/api';

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

export function useListUser(opts: ReqListUsers) {
  return useQuery({
    enabled: !!opts.search,
    queryKey: ['listUsers', opts.org_id, opts.project_id, opts.search],
    queryFn: async (): Promise<ResListUsersSuccess> => {
      const { json, res } = await fetchApi<ResListUsers, ReqListUsers>(
        '/users',
        {
          qp: opts,
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
