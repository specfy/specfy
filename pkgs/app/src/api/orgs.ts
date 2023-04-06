import { useQuery } from '@tanstack/react-query';
import type {
  ReqPostOrg,
  ResListOrgs,
  ResListOrgsSuccess,
  ResPostOrg,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListOrgs() {
  return useQuery({
    queryKey: ['listOrgs'],
    queryFn: async (): Promise<ResListOrgsSuccess> => {
      const { json, res } = await fetchApi<ResListOrgs>('/orgs');

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function createOrg(data: ReqPostOrg): Promise<ResPostOrg> {
  const { json } = await fetchApi<ResPostOrg, undefined, ReqPostOrg>(
    '/orgs',
    { body: data },
    'POST'
  );

  queryClient.removeQueries(['listOrgs']);

  return json;
}
