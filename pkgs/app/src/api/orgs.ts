import { useQuery } from '@tanstack/react-query';
import type {
  ReqOrgParams,
  ReqPostOrg,
  ReqPutOrg,
  ResDeleteOrg,
  ResListOrgs,
  ResListOrgsSuccess,
  ResPostOrg,
  ResPutOrg,
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
  const { json, res } = await fetchApi<ResPostOrg, undefined, ReqPostOrg>(
    '/orgs',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listOrgs']);
  }

  return json;
}

export async function updateOrg(
  opts: ReqOrgParams,
  data: ReqPutOrg
): Promise<ResPutOrg> {
  const { json, res } = await fetchApi<ResPutOrg, undefined, ReqPutOrg>(
    `/orgs/${opts.org_id}`,
    { body: data },
    'PUT'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function deleteOrg(opts: ReqOrgParams): Promise<number> {
  const { res } = await fetchApi<ResDeleteOrg>(
    `/orgs/${opts.org_id}`,
    undefined,
    'DELETE'
  );

  if (res.status === 204) {
    queryClient.removeQueries(['listProjects', opts.org_id]);
    queryClient.removeQueries(['listOrgs']);
  }

  return res.status;
}
