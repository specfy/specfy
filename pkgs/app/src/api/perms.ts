import type { ReqListPerms, ResListPerms } from 'api/src/types/api/perms';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListPerms(opts: Pick<ReqListPerms, 'org_id'>) {
  return useQuery({
    queryKey: ['listPermsOrg', opts.org_id],
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
    queryKey: ['listPermsProject', opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResListPerms> => {
      const { json } = await fetchApi<ResListPerms, ReqListPerms>(`/perms`, {
        qp: { org_id: opts.org_id, project_id: opts.project_id },
      });

      return json;
    },
  });
}
