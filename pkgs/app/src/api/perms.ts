import { useQuery } from '@tanstack/react-query';
import type {
  ReqDeletePerms,
  ReqListPerms,
  ReqPutPerms,
  ResDeletePerms,
  ResListPerms,
  ResPutPerms,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export function useListPerms(opts: Pick<ReqListPerms, 'org_id'>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id],
    queryFn: async (): Promise<ResListPerms> => {
      const { json } = await fetchApi<ResListPerms, ReqListPerms>('/perms', {
        qp: { org_id: opts.org_id },
      });

      return json;
    },
  });
}

export function useListPermsProject(opts: Required<ReqListPerms>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListPerms> => {
      const { json } = await fetchApi<ResListPerms, ReqListPerms>(`/perms`, {
        qp: { org_id: opts.org_id, project_id: opts.project_id },
      });

      return json;
    },
  });
}

export async function updatePerm(opts: ReqPutPerms) {
  const { json } = await fetchApi<ResPutPerms, undefined, ReqPutPerms>(
    '/perms',
    { body: opts },
    'PUT'
  );

  queryClient.removeQueries(['listPerms', opts.org_id, opts.project_id]);

  return json;
}

export async function removePerm(opts: ReqDeletePerms) {
  const { json } = await fetchApi<ResDeletePerms, undefined, ReqDeletePerms>(
    '/perms',
    { body: opts },
    'DELETE'
  );

  queryClient.removeQueries(['listPerms', opts.org_id, opts.project_id]);

  return json;
}
