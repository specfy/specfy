import type { ListKeys } from '@specfy/models';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListKeys(opts: ListKeys['Querystring']) {
  return useQuery({
    queryKey: ['listKeys', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ListKeys['Success']> => {
      const { json, res } = await fetchApi<ListKeys>('/keys', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
