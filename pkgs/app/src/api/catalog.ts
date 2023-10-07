import { useQuery } from '@tanstack/react-query';

import type { ListCatalog } from '@specfy/models';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListCatalog(opts: ListCatalog['Querystring']) {
  return useQuery({
    queryKey: ['listCatalog', opts.org_id, opts.type],
    queryFn: async (): Promise<ListCatalog['Success']> => {
      const { json, res } = await fetchApi<ListCatalog>('/catalog', {
        qp: opts,
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
