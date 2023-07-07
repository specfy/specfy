import type { GetFlow } from '@specfy/api/src/types/api';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useGetFlow({ org_id, project_id }: GetFlow['Querystring']) {
  return useQuery({
    queryKey: ['getFlow', org_id, project_id],
    queryFn: async (): Promise<GetFlow['Success']> => {
      const { json, res } = await fetchApi<GetFlow>(`/flows`, {
        qp: { org_id, project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
