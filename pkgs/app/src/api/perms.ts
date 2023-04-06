import { useQuery } from '@tanstack/react-query';
import type {
  ReqDeletePerms,
  ReqListPerms,
  ReqPutPerms,
  ResDeletePerms,
  ResListPerms,
  ResListPermsSuccess,
  ResPutPerms,
} from 'api/src/types/api';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListPerms(opts: Pick<ReqListPerms, 'org_id'>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id],
    queryFn: async (): Promise<ResListPermsSuccess> => {
      const { json, res } = await fetchApi<ResListPerms, ReqListPerms>(
        '/perms',
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

export function useListPermsProject(opts: Required<ReqListPerms>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListPermsSuccess> => {
      const { json, res } = await fetchApi<ResListPerms, ReqListPerms>(
        `/perms`,
        {
          qp: { org_id: opts.org_id, project_id: opts.project_id },
        }
      );

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

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
