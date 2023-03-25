import { useQuery } from '@tanstack/react-query';
import type { ReqListPolicies, ResListPolicies } from 'api/src/types/api';

import { fetchApi } from './fetch';

export function useListPolicies(opts: ReqListPolicies) {
  return useQuery({
    queryKey: ['listPolicies', opts.org_id],
    queryFn: async (): Promise<ResListPolicies> => {
      const { json } = await fetchApi<ResListPolicies, ReqListPolicies>(
        '/policies',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}
