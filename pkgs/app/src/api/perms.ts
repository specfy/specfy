import type {
  DeletePerm,
  GetCountPerms,
  ListPerms,
  PutPerm,
} from '@specfy/api/src/types/api';
import type { PermType } from '@specfy/api/src/types/db';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export const roleReadable: Record<PermType, string> = {
  contributor: 'Contributor',
  owner: 'Owner',
  reviewer: 'Reviewer',
  viewer: 'Viewer',
};

export function useCountPerms(opts: GetCountPerms['Querystring']) {
  return useQuery({
    queryKey: ['countPerms', opts.org_id, opts.project_id],
    queryFn: async (): Promise<GetCountPerms['Success']> => {
      const { json, res } = await fetchApi<GetCountPerms>('/perms/count', {
        qp: { org_id: opts.org_id, project_id: opts.project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useListPerms(opts: Pick<ListPerms['Querystring'], 'org_id'>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id],
    queryFn: async (): Promise<ListPerms['Success']> => {
      const { json, res } = await fetchApi<ListPerms>('/perms', {
        qp: { org_id: opts.org_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export function useListPermsProject(opts: Required<ListPerms['Querystring']>) {
  return useQuery({
    queryKey: ['listPerms', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ListPerms['Success']> => {
      const { json, res } = await fetchApi<ListPerms>(`/perms`, {
        qp: { org_id: opts.org_id, project_id: opts.project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}

export async function updatePerm(opts: PutPerm['Body']) {
  const { json } = await fetchApi<PutPerm>('/perms', { body: opts }, 'PUT');

  queryClient.invalidateQueries(['listPerms', opts.org_id, opts.project_id]);

  return json;
}

export async function removePerm(opts: DeletePerm['Body']) {
  const { json, res } = await fetchApi<DeletePerm>(
    '/perms',
    { body: opts },
    'DELETE'
  );

  if (res.status === 204) {
    queryClient.invalidateQueries(['countPerms', opts.org_id]);
    queryClient.invalidateQueries(['listPerms', opts.org_id, opts.project_id]);
  }

  return json;
}
