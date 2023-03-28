import { useQuery } from '@tanstack/react-query';
import type {
  ApiOrg,
  ReqPostOrg,
  ResListOrgs,
  ResPostOrg,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function listOrgs(): Promise<ApiOrg[]> {
  const res = await fetch('http://localhost:3000/0/orgs');
  const json = (await res.json()) as ResListOrgs;

  return json.data;
}

export function useListOrgs() {
  return useQuery({
    queryKey: ['listOrgs'],
    queryFn: async (): Promise<ApiOrg[]> => {
      return await listOrgs();
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
