import type { ReqListActivities, ResListActivities } from 'api/src/types/api';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListActivities(opts: ReqListActivities) {
  return useQuery({
    queryKey: ['listActivities', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListActivities> => {
      const { json } = await fetchApi<ResListActivities, ReqListActivities>(
        '/activities',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}
