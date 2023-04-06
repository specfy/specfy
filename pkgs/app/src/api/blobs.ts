import { useQuery } from '@tanstack/react-query';
import type {
  ResListRevisionBlobs,
  ReqGetRevision,
  ReqRevisionParams,
  ResListRevisionBlobsSuccess,
} from 'api/src/types/api';

import { fetchApi } from './fetch';
import { APIError, isError } from './helpers';

export function useListRevisionBlobs({
  org_id,
  project_id,
  revision_id,
}: Partial<ReqRevisionParams> & ReqGetRevision) {
  return useQuery({
    enabled: !!revision_id,
    queryKey: ['listBlobs', org_id, project_id, revision_id],
    queryFn: async (): Promise<ResListRevisionBlobsSuccess> => {
      const { json, res } = await fetchApi<
        ResListRevisionBlobs,
        ReqGetRevision
      >(`/revisions/${revision_id}/blobs`, {
        qp: { org_id, project_id },
      });

      if (res.status !== 200 || isError(json)) {
        throw new APIError({ res, json });
      }

      return json;
    },
  });
}
