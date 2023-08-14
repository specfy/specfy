import type { ListActivities } from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListActivities(opts: ListActivities['Querystring']) {
  return useQuery({
    queryKey: [
      'listActivities',
      opts.org_id,
      opts.project_id,
      opts.revision_id,
    ],
    queryFn: async (): Promise<ListActivities['Success']> => {
      const { json, res } = await fetchApi<ListActivities>('/activities', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
