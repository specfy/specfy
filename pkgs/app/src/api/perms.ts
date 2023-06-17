import { useQuery } from '@tanstack/react-query';
import type {
  ReqDeletePerms,
  ReqListPerms,
  ReqPutPerms,
  ResCountPerms,
  ResCountPermsSuccess,
  ResDeletePerms,
  ResListPerms,
  ResListPermsSuccess,
  ResPutPerms,
} from 'api/src/types/api';
import type { PermType } from 'api/src/types/db';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export const roleReadable: Record<PermType, string> = {
  contributor: 'Contributor',
  owner: 'Owner',
  reviewer: 'Reviewer',
  viewer: 'Viewer',
};

export function useCountPerms(opts: ReqListPerms) {
  return useQuery({
    queryKey: ['countPerms', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResCountPermsSuccess> => {
      const { json, res } = await fetchApi<ResCountPerms, ReqListPerms>(
        '/perms/count',
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
  const { json, res } = await fetchApi<
    ResDeletePerms,
    undefined,
    ReqDeletePerms
  >('/perms', { body: opts }, 'DELETE');

  if (res.status === 204) {
    queryClient.removeQueries(['countPerms', opts.org_id]);
    queryClient.removeQueries(['listPerms', opts.org_id, opts.project_id]);
  }

  return json;
}
