import type {
  ReqPostRevision,
  ReqGetRevision,
  ResGetRevision,
  ResPostRevision,
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

  queryClient.removeQueries(['listRevisions', data.orgId]);

  return json;
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

export function useGetRevision(opts: ReqGetRevision) {
  return useQuery({
    queryKey: ['getRevision', opts.id, opts.org_id, opts.project_id],
    queryFn: async (): Promise<ResGetRevision> => {
      const { json } = await fetchApi<ResGetRevision, ReqGetRevision>(
        `/revisions`,
        {
          qp: opts,
        }
      );

      return json;
    },
  });
}
