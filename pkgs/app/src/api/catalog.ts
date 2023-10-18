import { useQuery } from '@tanstack/react-query';

import type { GetCatalog, ListCatalog } from '@specfy/models';

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

export function useGetCatalog(opts: GetCatalog['QP']) {
  return useQuery({
    queryKey: ['getCatalog', opts.org_id, opts.tech_id],
    queryFn: async (): Promise<GetCatalog['Success']> => {
      const { json, res } = await fetchApi<GetCatalog>(
        `/catalog/${opts.tech_id}`,
        {
          qp: { org_id: opts.org_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
