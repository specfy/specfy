import type { ResListRevisionBlobs } from 'api/src/types/api/blob';
import type {
  ReqGetRevision,
  ReqRevisionParams,
} from 'api/src/types/api/revisions';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListRevisionBlobs({
  org_id,
  project_id,
  revision_id,
}: Partial<ReqRevisionParams> & ReqGetRevision) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['listRevisions', revision_id, org_id, project_id],
    queryFn: async (): Promise<ResListRevisionBlobs> => {
      const { json } = await fetchApi<ResListRevisionBlobs, ReqGetRevision>(
        `/revisions/${revision_id}/blobs`,
        {
          qp: { org_id, project_id },
        }
      );

      return json;
    },
  });
}
