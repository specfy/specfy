import type {
  ReqPostRevision,
  ReqGetRevision,
  ResGetRevision,
  ResPostRevision,
  ReqListRevisions,
  ResListRevisions,
  ReqRevisionParams,
  ResMergeRevision,
} from 'api/src/types/api/revisions';
import { useQuery } from 'react-query';

import { queryClient } from '../common/query';

import { fetchApi } from './fetch';

export async function createRevision(
  data: ReqPostRevision
): Promise<ResPostRevision> {
  const { json } = await fetchApi<ResPostRevision>(
    '/revisions',
    { body: data },
    'POST'
  );

  queryClient.removeQueries(['listRevisions', data.orgId, data.projectId]);

  return json;
}

export function useListRevisions(opts: ReqListRevisions) {
  return useQuery({
    queryKey: ['listRevisions', opts.org_id, opts.project_id, opts.status],
    queryFn: async (): Promise<ResListRevisions> => {
      const { json } = await fetchApi<ResListRevisions, ReqListRevisions>(
        '/revisions',
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}

// export async function deleteRevision(opts: ReqRevisionParams) {
//   const { json } = await fetchApi<ResPostRevision>(
//     `/revisions/${opts.org_id}/${opts.project_slug}`,
//     undefined,
//     'DELETE'
//   );

//   queryClient.removeQueries(['listRevisions', opts.org_id]);
//   queryClient.removeQueries(['getRevision', opts.org_id, opts.project_slug]);

//   return json;
// }

export function useGetRevision({
  org_id,
  project_id,
  revision_id,
}: ReqGetRevision & ReqRevisionParams) {
  return useQuery({
    queryKey: ['getRevision', revision_id, org_id, project_id],
    queryFn: async (): Promise<ResGetRevision> => {
      const { json } = await fetchApi<ResGetRevision, ReqGetRevision>(
        `/revisions/${revision_id}`,
        {
          qp: { org_id, project_id },
        }
      );

      return json;
    },
  });
}

export async function mergeRevision({
  org_id,
  project_id,
  revision_id,
}: ReqGetRevision & ReqRevisionParams): Promise<ResMergeRevision> {
  const { json, res } = await fetchApi<ResMergeRevision, ReqGetRevision>(
    `/revisions/${revision_id}/merge`,
    {
      qp: { org_id, project_id },
    },
    'POST'
  );

  if (res.status === 200) {
    queryClient.removeQueries(['listRevisions', org_id, project_id]);
    queryClient.removeQueries(['getRevision', revision_id, org_id, project_id]);
  }

  return json;
}
