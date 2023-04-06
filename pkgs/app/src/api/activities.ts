import { useQuery } from '@tanstack/react-query';
import type {
  ReqListActivities,
  ResListActivities,
  ResListActivitiesSuccess,
} from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListActivities(opts: ReqListActivities) {
  return useQuery({
    queryKey: ['listActivities', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListActivitiesSuccess> => {
      const { json, res } = await fetchApi<
        ResListActivities,
        ReqListActivities
      >('/activities', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
