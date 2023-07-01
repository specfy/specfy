import type {
  DeleteOrg,
  ListOrgs,
  PostOrg,
  PutOrg,
} from '@specfy/api/src/types/api';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListOrgs() {
  return useQuery({
    queryKey: ['listOrgs'],
    queryFn: async (): Promise<ListOrgs['Success']> => {
      const { json, res } = await fetchApi<ListOrgs>('/orgs');

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function createOrg(
  data: PostOrg['Body']
): Promise<PostOrg['Reply']> {
  const { json, res } = await fetchApi<PostOrg>(
    '/orgs',
    { body: data },
    'POST'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function updateOrg(
  opts: PutOrg['Params'],
  data: PutOrg['Body']
): Promise<PutOrg['Reply']> {
  const { json, res } = await fetchApi<PutOrg>(
    `/orgs/${opts.org_id}`,
    { body: data },
    'PUT'
  );

  if (res.status === 200) {
    queryClient.invalidateQueries(['listOrgs']);
  }

  return json;
}

export async function deleteOrg(opts: DeleteOrg['Params']): Promise<number> {
  const { res } = await fetchApi<DeleteOrg>(
    `/orgs/${opts.org_id}`,
    undefined,
    'DELETE'
  );

  if (res.status === 204) {
    queryClient.invalidateQueries(['listProjects', opts.org_id]);
    queryClient.invalidateQueries(['listOrgs']);
  }

  return res.status;
}
