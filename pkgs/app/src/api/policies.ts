import { useQuery } from '@tanstack/react-query';
import type { ListPolicies } from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListPolicies(opts: ListPolicies['Querystring']) {
  return useQuery({
    queryKey: ['listPolicies', opts.org_id],
    queryFn: async (): Promise<ListPolicies['Success']> => {
      const { json, res } = await fetchApi<ListPolicies>('/policies', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
