import type {
  ResListRevisionBlobs,
  ReqGetRevision,
  ReqRevisionParams,
} from 'api/src/types/api';
import { useQuery } from 'react-query';

import { fetchApi } from './fetch';

export function useListRevisionBlobs({
  org_id,
  project_id,
  revision_id,
}: Partial<ReqRevisionParams> & ReqGetRevision) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['listBlobs', org_id, project_id, revision_id],
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
