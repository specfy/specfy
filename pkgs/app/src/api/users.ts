import { useQuery } from '@tanstack/react-query';
import type {
  ReqListUsers,
  ResListUsers,
  ResListUsersSuccess,
} from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

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
