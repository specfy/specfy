import { useQuery } from '@tanstack/react-query';
import type {
  ReqListPolicies,
  ResListPolicies,
  ResListPoliciesSuccess,
} from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListPolicies(opts: ReqListPolicies) {
  return useQuery({
    queryKey: ['listPolicies', opts.org_id],
    queryFn: async (): Promise<ResListPoliciesSuccess> => {
      const { json, res } = await fetchApi<ResListPolicies, ReqListPolicies>(
        '/policies',
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
