import { useQuery } from '@tanstack/react-query';
import type {
  ApiMe,
  ReqListUsers,
  ResGetMe,
  ResListUsers,
} from 'api/src/types/api';

import { fetchApi } from './fetch';

export async function getMe(): Promise<ApiMe> {
  const { json } = await fetchApi<ResGetMe>('/me');

  return json.data;
}

export function useGetMe() {
  return useQuery({
    queryKey: ['getMe'],
    queryFn: async (): Promise<ApiMe> => {
      return await getMe();
    },
  });
}

export function useListUser(opts: ReqListUsers) {
  return useQuery({
    enabled: !!opts.search,
    queryKey: ['listUsers', opts.org_id, opts.project_id, opts.search],
    queryFn: async (): Promise<ResListUsers> => {
      const { json } = await fetchApi<ResListUsers, ReqListUsers>('/users', {
        qp: opts,
      });

      return json;
    },
  });
}
